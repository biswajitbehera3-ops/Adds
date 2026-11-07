#!/bin/sh
# Parent-owned sandbox: sbx.sh <scratch-dir> <cmd...>
# No network (new net ns), whole filesystem read-only except <scratch-dir>, empty allowlisted env,
# CPU 120 s, data 4 GiB, 256 processes, 64 MiB per file, 300 s wall clock.
SCR="$1"; shift
[ -d "$SCR" ] || { echo "no scratch dir" >&2; exit 2; }
mkdir -p "$SCR/tmp" "$SCR/home"
exec unshare -rnm --fork sh -c '
  SCR="$1"; shift
  mount --bind "$SCR" "$SCR" || exit 3
  mount -o remount,bind,ro / || exit 3
  for m in /dev/shm /run/sandbox-telemetry /sys /sys/fs/cgroup; do mount -o remount,bind,ro "$m" 2>/dev/null; done
  cd "$SCR"
  exec env -i PATH=/usr/local/bin:/usr/bin:/bin HOME="$SCR/home" TMPDIR="$SCR/tmp" CI=1 NODE_ENV=test \
    timeout 300 prlimit --cpu=120 --data=4294967296 --nproc=256 --fsize=67108864 -- "$@"
' sh "$SCR" "$@"
