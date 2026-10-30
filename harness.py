"""Runs one student program and reports what happened. Called from worker.js.

Browsers cannot pause Python at input() without special server headers (which GitHub Pages
cannot send). So input() is replayed: the program gets a list of answers typed so far; when it
asks for one more than we have, we stop with status "need_input", the page asks the student,
then runs the program again from the top with the extra answer. A fixed random seed makes
every replay behave the same.
"""
import ast, builtins, json, random, sys, traceback

_real_randint = random.randint


class NeedInput(BaseException):
    pass


class OutputLimit(BaseException):
    pass


class _Out:
    """Collects printed text and stops runaway printing."""
    def __init__(self):
        self.parts, self.size = [], 0

    def write(self, text):
        self.size += len(text)
        if self.size > 20000:
            raise OutputLimit()
        self.parts.append(text)
        return len(text)

    def flush(self):
        pass

    def text(self):
        return "".join(self.parts)


def _uses_loop(code):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return False
    return any(isinstance(n, (ast.For, ast.While, ast.AsyncFor)) for n in ast.walk(tree))


def _friendly_error(exc, code):
    lines = code.split("\n")
    if isinstance(exc, SyntaxError):
        n, msg = exc.lineno or 0, exc.msg
    else:
        n = 0
        for frame in traceback.extract_tb(exc.__traceback__):
            if frame.filename == "<student>":
                n = frame.lineno
        msg = f"{type(exc).__name__}: {exc}"
    text = lines[n - 1].strip() if 0 < n <= len(lines) else ""
    if isinstance(exc, SyntaxError):
        head = "SyntaxError" + (f" on line {n}" if n else "") + f": {msg}"
    else:
        head = f"Error on line {n}. {msg}" if n else msg
    return head + (f"\n    {text}" if text else "")


def run_program(code, inputs_json, seed, setup=""):
    queue = list(json.loads(inputs_json))
    out = _Out()
    result = {"status": "done", "error": ""}
    random.seed(seed)
    random.randint = _real_randint  # undo any patch from an earlier test

    def fake_input(prompt=""):
        out.write(str(prompt))
        if not queue:
            raise NeedInput()
        value = str(queue.pop(0))
        out.write(value + "\n")  # echo the answer, like a real terminal
        return value

    old_stdout, old_input = sys.stdout, builtins.input
    sys.stdout, builtins.input = out, fake_input
    try:
        if setup:
            exec(setup, {})  # tests use this to fix random numbers
        exec(compile(code, "<student>", "exec"), {"__name__": "__main__"})
    except NeedInput:
        result["status"] = "need_input"
    except OutputLimit:
        result.update(status="error", error="Too much output: your program printed more than 20,000 characters. Is a loop printing forever?")
    except SystemExit:
        pass
    except BaseException as exc:  # SyntaxError, NameError, ZeroDivisionError, ...
        result.update(status="error", error=_friendly_error(exc, code))
    finally:
        sys.stdout, builtins.input = old_stdout, old_input
    result["output"] = out.text()
    result["usesLoop"] = _uses_loop(code)
    return json.dumps(result)
