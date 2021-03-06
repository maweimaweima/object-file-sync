const CacheFilesKeyMap = require('./CacheFileKeyValueMap');

function CacheDirKeyMap(dir) {
  this.cacheFileMap = new Map();
  this.dir = dir;
}

/**
 * 缓存文件，内部根据dir分发到对应的cache缓存
 * @param file
 * @param content
 */
CacheDirKeyMap.prototype.addFileCache = function (file, content) {
  const filesKeyMap = this.cacheFileMap.get(file);
  // 如果内容相同，则不再加入
  if (filesKeyMap && filesKeyMap.content === content) {
    return;
  }
  this.cacheFileMap.delete(file);
  this.cacheFileMap.set(file, new CacheFilesKeyMap(file, content, this))
}

CacheDirKeyMap.prototype.getValue = function (key) {
  for (let [file, cacheFileKeyValueMap] of this.cacheFileMap){
    if (cacheFileKeyValueMap.hasKey(key)) {
      return cacheFileKeyValueMap.get(key);
    }
  }
}

CacheDirKeyMap.prototype.hasKey = function (file) {
  for (let [innerFile, cacheFileKeyValueMap] of this.cacheFileMap){
    if (cacheFileKeyValueMap.hasKey(file)) {
      return innerFile;
    }
  }
}

CacheDirKeyMap.prototype.hasKeyByFile = function (file, key) {
  const fileMap =  this.cacheFileMap.get(file);
  return fileMap && fileMap.hasKey(key)
}

CacheDirKeyMap.prototype.hasValue = function (value) {
  for (let [innerFile, cacheFileKeyValueMap] of this.cacheFileMap){
    if (cacheFileKeyValueMap.hasValue(value)) {
      return innerFile;
    }
  }
}

CacheDirKeyMap.prototype.clearFileCache = function (file) {
  this.cacheFileMap.delete(file);
}

module.exports = CacheDirKeyMap;
