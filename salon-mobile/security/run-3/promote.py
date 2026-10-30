#!/usr/bin/env python3
"""Parent-side promotion: promote.py <agent-root> <rel-path> <max-bytes>
Copies <agent-root>/scratch/<rel> to <agent-root>/artifacts/<rel> with no-follow, descriptor-relative,
regular-file, single-link, size-bounded checks. Exit 0 on success, 1 on any refusal."""
import os, sys, stat
root, rel, maxb = sys.argv[1], sys.argv[2], int(sys.argv[3])
parts = rel.split("/")
if rel.startswith("/") or not rel or any(p in ("", ".", "..") for p in parts): sys.exit("bad path")
D = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
sroot = os.open(os.path.join(root, "scratch"), D); aroot = os.open(os.path.join(root, "artifacts"), D)
def walk(fd, comps, create):
    for c in comps:
        if create:
            try: os.mkdir(c, 0o700, dir_fd=fd)
            except FileExistsError: pass
        nfd = os.open(c, D, dir_fd=fd)
        if not stat.S_ISDIR(os.fstat(nfd).st_mode): sys.exit("not dir")
        fd = nfd
    return fd
sd = walk(sroot, parts[:-1], False)
src = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK | os.O_CLOEXEC, dir_fd=sd)
st = os.fstat(src)
if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1 or st.st_size > maxb: sys.exit("refused: type/links/size")
data = b""
while len(data) <= maxb:
    b = os.read(src, 65536)
    if not b: break
    data += b
st2 = os.fstat(src)
if len(data) != st.st_size or len(data) > maxb or (st2.st_ino, st2.st_size, st2.st_nlink, st2.st_mode) != (st.st_ino, st.st_size, st.st_nlink, st.st_mode): sys.exit("refused: changed")
dd = walk(aroot, parts[:-1], True)
dst = os.open(parts[-1], os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o600, dir_fd=dd)
dsts = os.fstat(dst)
if not stat.S_ISREG(dsts.st_mode) or dsts.st_nlink != 1: sys.exit("refused: dest")
os.write(dst, data); os.close(dst); print("promoted", rel, len(data))
