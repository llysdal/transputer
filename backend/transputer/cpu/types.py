def isInt(value):
  try:
    int(value)
    return True
  except:
    return False
  
def isHex(value):
  try:
    if value[0:2].upper() == '&H':
      return True
  except:
    return False
  
def is7Bit(value):
  try:
    if isInt(value):
      v = int(value)
    elif isHex(value):
      v = int(value[2:], 16)
    else:
      return False
    
    return -128 <= v <= 127
  except:
    return False
  
def is8Bit(value):
  try:
    if isInt(value):
      v = int(value)
    elif isHex(value):
      v = int(value[2:], 16)
    else:
      return False
    
    return 0 <= v <= 255
  except:
    return False
  
def is16Bit(value):
  try:
    if isInt(value):
      v = int(value)
    elif isHex(value):
      v = int(value[2:], 16)
    else:
      return False
    
    return 0 <= v <= 65535
  except:
    return False
  
def isString(value):
  return isinstance(value, str)

def isRegister(value):
  return isinstance(value, str) and value[0] == '$' and value[1:].isnumeric()

def isLocation(value):
  return isinstance(value, str) and value[0:2] == '($' and value[2:-1].isnumeric() and value[-1] == ')'

def isFlag(value):
  return isinstance(value, str) and value.upper() in ['C', 'Z', 'NC', 'NZ']

def isNegativeFlag(value):
  return isinstance(value, str) and value.upper() in ['NC', 'NZ']

def isLabel(value):
  return isinstance(value, str) and value[-1] == ':'

def isComment(value):
  return isinstance(value, str) and len(value) > 0 and value[0] == ';'