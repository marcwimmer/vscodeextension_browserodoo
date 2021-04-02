import sys
from pathlib import Path
import click

before = 10
after = 10

line = sys.argv[1]
line = line.split(":::")[-1]
line = line.replace("::", ":")
file, lineno = line.split(":")
lineno = int(lineno)

lines = Path(file).read_text().split("\n")

start = lineno - before
end = lineno + after
if start < 0:
    end = lineno + after - start # append behind
    start = 0

lines = lines[start:end]

i = start
for line in lines:
    print(f"{str(i + 1).zfill(2)}\t{line}")
    i += 1