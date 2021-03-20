#from .types import isInt, isHex, is8Bit, is16Bit, isString, isRegister, isFlag, isNegativeFlag, isLabel, isComment

class Memory:
  def __init__(self, size):
    self.values = [0,] * size
    self.buffer = [0,] * size
    self.changes = set()
  
  def write(self, loc, value):
    self.buffer[loc] = value
    self.changes.add(loc)

  def read(self, loc):
    return self.values[loc]
  
  def size(self):
    return len(self.values)
  
  def commit(self):
    for loc in self.changes:
      self.values[loc] = self.buffer[loc]
    
    self.changes.clear()
    
  def freeze(self):
    return self.values.copy()
  
class IO:
  def __init__(self, inputs):
    self.inputs = inputs
    self.outputs = []
    
  def freeze(self):
    return {
      'input': self.inputs.copy(),
      'output': self.outputs.copy()
    }
    
  def get(self):
    if (len(self.inputs) == 0):
      return 0
    
    val = self.inputs[0]
    self.inputs.pop(0)
    return val

  def put(self, val):
    self.outputs.append(val)