const path = require('path');
const fse = require('fs-extra');
const { success, warn } = require('console-log-cmd');
const { addFileImport, addDirImport } = require('auto-import-module');
const { getModuleOptions, getRelativeDir } = require('../utils/moduleOptions');
const cacheFilter = require('./cacheFilter');
const fileReplace = require('./fileReplace');
const { readFile } = require('../utils/cacheFile');
const {
  Operate_File_Add,
  Operate_File_Change,
  Operate_File_Delete
}  = require('./constants/fileOperate');
const CacheFilesKeyMap = require('./cacheFilesKeyMap');

/**
 * 获取其他需要同步的目录
 * @param file
 * @param operate
 * @returns {[]|*[]}
 */
function getSyncDirs(file, operate) {
  const { dirs } = getModuleOptions();
  const syncDirs = [];
  let relativeDir;
  dirs.forEach(dir => {
    if (file.indexOf(dir) === -1) {
      syncDirs.push(dir);
    } else {
      syncDirs.push(dir);
      relativeDir = file.replace(dir, '');
    }
  });
  if (!relativeDir) {
    return [];
  }
  const absoluteDirs = syncDirs.map(dir => {
    return path.join(dir, relativeDir);
  });
  return cacheFilter(absoluteDirs, operate);
}
/**
 * 同步目录文件
 * @param target
 * @param dist
 */
function syncDir(target, dist, operate, isDir, targetContentsPromises, distContentPromise) {
  const exists = fse.pathExistsSync(dist)
  if (operate === Operate_File_Add) {
    if (!exists) {
      fse.copySync(target, dist);
      success(`[文件同步] 复制成功: ${getRelativeDir(dist)}`);
    }
    const isFile = /\.\w+$/;
    // 读取文件内容，以便做第一次修改的对比处理
    if(target.match(isFile)){
      readFile(target);
    }
    if(dist.match(isFile)){
      readFile(dist);
    }
    // 对文件类型进行内容检查
    if (!isDir) {
      fileReplace(target, dist, targetContentsPromises, distContentPromise);
    }
    if (getModuleOptions().autoImportModule) {
      if (isDir) {
        addDirImport(dist);
      } else {
        addFileImport(dist);
      }
    }
  }
  else if (exists && operate === Operate_File_Delete) {
    fse.removeSync(dist);
    CacheFilesKeyMap.getSingletonCacheKeyMap().clearFileCache(dist);
    warn(`[文件同步] 删除成功: ${getRelativeDir(dist)}`)
  } else if (operate === Operate_File_Change) {
    if (exists) {
      fileReplace(target, dist, targetContentsPromises, distContentPromise);
    } else {
      fse.copy(target, dist);
      success(`[文件同步] 复制成功: ${getRelativeDir(dist)}`)
    }
  }
}

Object.assign(module.exports, {
  getSyncDirs,
  syncDir,
});
