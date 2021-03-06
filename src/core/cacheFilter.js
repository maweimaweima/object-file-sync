const {
  Operate_File_Add,
  Operate_File_Change,
  Operate_File_Delete
}  = require('./constants/fileOperate');

const cache = new Map();

function getTime(time, operate){
  switch (operate){
    case Operate_File_Add:
      return time + 100;
    case Operate_File_Delete:
      return time + 100;
    case Operate_File_Change:
      return time + 200;
    default:
      return time + 50;
  }
}

function filter(dir, operate) {
  const time = cache.get(dir);
  if (time) {
    return Date.now() - getTime(time, operate) > 10;
  } else {
    return true;
  }
}

function cacheFilter(dirs, operate) {
  const validDirs = [];
  dirs.forEach((dir) => {
    // 超出失效日期，更新时间戳
    if (filter(dir, operate)) {
      cache.set(dir, Date.now());
      validDirs.push(dir);
    }
  })
  return validDirs;
}

module.exports = cacheFilter;
