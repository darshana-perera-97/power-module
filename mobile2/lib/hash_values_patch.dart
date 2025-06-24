// This replaces the removed hashValues Flutter internal function.
int hashValues(Object? arg1, [Object? arg2, Object? arg3, Object? arg4,
    Object? arg5, Object? arg6, Object? arg7, Object? arg8, Object? arg9]) {
  var hash = 0;
  var args = [arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9];
  for (var arg in args) {
    if (arg == null) continue;
    hash = 0x1fffffff & (hash + arg.hashCode);
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    hash ^= (hash >> 6);
  }
  hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
  hash ^= (hash >> 11);
  hash = 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  return hash;
}
