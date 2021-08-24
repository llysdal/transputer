from .types import isInt, isHex, is8Bit, is16Bit, isString, isRegister, isLocation, isFlag, isNegativeFlag, isLabel, isComment
from .extra import Memory
from collections import deque

class Register:
  def __init__(self):
    self.value = 0
  
  def load(self, value):
    self.value = value

  def read(self):
    return self.value
  
class CPU:
  def __init__(self, memory, io):
    self.on = True
    self.pc = 0
    self.outOfInstructions = False
    self.registers = [
      Register(),
      Register(),
      Register(),
      Register()
    ]
    self.flags = {
      'Z': False,
      'C': False
    }
    self.memory = memory
    self.io = io
    self.callStack = deque()
    
    self.line = 0
    
  def loadInstructionStack(self, instack):
    if not instack:
      self.instack = [{
            'instruction': CPU.turnOff,
            'args': (),
            'line': None
          }]
    else:
      self.instack = instack
  
  def setRegister(self, reg, value):
    regIndex = int(reg[1:])
    self.registers[regIndex].load(value)
    
  def getRegister(self, reg):
    regIndex = int(reg[1:])
    return self.registers[regIndex].read()
  
  def getValueOrRegister(self, value):
    if isInt(value):
      return value
    elif isRegister(value):
      return self.getRegister(value)
    
  def getValue(self, value):
    if isInt(value):
      return value
    elif isRegister(value):
      return self.getRegister(value)
    elif isLocation(value):
      return self.memory.read(self.locationToIndex(value))
    
  def locationToIndex(self, loc):
    regIndex = int(loc[2:-1])
    locIndex = self.registers[regIndex].read()
    
    if locIndex >= self.memory.size() - 1:
      return self.memory.size() - 1
  
    return locIndex
  
  def incrementLocationRegister(self, loc):
    regIndex = int(loc[2:-1])
    self.registers[regIndex].load(self.registers[regIndex].read() + 1)
  
  def cycle(self):
    closure = self.instack[self.pc]
    function = closure['instruction']
    args = closure['args']
    
    function(self, *args)
    
    self.pc += 1
    if (self.pc >= len(self.instack) or not self.on):
      self.line = None
      self.outOfInstructions = True
      return False

    self.line = self.instack[self.pc]['line']
    self.outOfInstructions = False
    return True
      
  def setFlags(self, value):
    if value == 0:
      self.flags['Z'] = True
    else:
      self.flags['Z'] = False

    if value > 255:
      self.flags['C'] = True
      value -= 256
    elif value < 0:
      self.flags['C'] = True
      value += 256
    else:
      self.flags['C'] = False

    return value
    
  def getFlag(self, flag):
    if isNegativeFlag(flag):
      if not self.flags[flag[1:]]:
        return True
    elif self.flags[flag]:
      return True
    return False

  #Instructions 
  def turnOff(self):
    self.on = False
  
  def noOperation(self):
    pass
  
  def getStatus(self, dest):
    self.setRegister(dest, self.io.get())
    
  def putStatus(self, reg):
    self.io.put(self.getRegister(reg))
    
  def load(self, dest, value):
    self.setRegister(dest, self.getValue(value))
    
  def loadIncrement(self, dest, loc):
    self.load(dest, loc)
    self.incrementLocationRegister(loc)
    
  def store(self, value, loc):
    self.memory.write(self.locationToIndex(loc), self.getValueOrRegister(value))
    
  def storeIncrement(self, value, loc):
    self.store(value, loc)
    self.incrementLocationRegister(loc)
    
  def add(self, dest, value):
    v = self.getRegister(dest) + self.getValue(value)
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def addCheck(self, dest, value):
    v = self.getRegister(dest) + self.getValue(value)
    self.setFlags(v)

  def sub(self, dest, value):
    v = self.getRegister(dest) - self.getValue(value)
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def subCheck(self, dest, value):
    v = self.getRegister(dest) - self.getValue(value)
    self.setFlags(v)
    
  def logicalAnd(self, dest, value):
    v = self.getRegister(dest) & self.getValue(value)
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def logicalAndCheck(self, dest, value):
    v = self.getRegister(dest) & self.getValue(value)
    self.setFlags(v)
    
  def logicalNand(self, dest, value):
    v = ~(self.getRegister(dest) & self.getValue(value))
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def logicalNandCheck(self, dest, value):
    v = ~(self.getRegister(dest) & self.getValue(value))
    self.setFlags(v)
  
  def logicalOr(self, dest, value):
    v = self.getRegister(dest) | self.getValue(value)
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def logicalOrCheck(self, dest, value):
    v = self.getRegister(dest) | self.getValue(value)
    self.setFlags(v)
  
  def logicalXor(self, dest, value):
    v = self.getRegister(dest) ^ self.getValue(value)
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def logicalXorCheck(self, dest, value):
    v = self.getRegister(dest) ^ self.getValue(value)
    self.setFlags(v)
    
  def rotateUp(self, dest):
    v = self.getRegister(dest) << 1
    if self.flags['C']:
      v += 1
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def rotateDown(self, dest):
    v = self.getRegister(dest) >> 1
    if self.flags['C']:
      v += 128
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def bitUp(self, dest):
    v = self.getRegister(dest) << 1
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def bitDown(self, dest):
    v = self.getRegister(dest) >> 1
    v = self.setFlags(v)
    self.setRegister(dest, v)
  def invert(self, dest):
    v = ~self.getRegister(dest)
    v = self.setFlags(v)
    self.setRegister(dest, v)
    
  def jumpFlag(self, flag, value):
    if self.getFlag(flag):
      self.jump(value)
    
  def jump(self, value):
    self.pc = int(value) - 1  
    
  def jumpRelativeFlag(self, flag, value):
    if self.getFlag(flag):
      self.jumpRelative(value)
      
  def jumpRelative(self, value):
    self.pc += int(value) - 1
    if (self.pc < -1):
      self.pc += 256

  def callSubFlag(self, flag, location):
    if self.getFlag(flag):
      self.callSub(location)
  
  def callSub(self, location):
    self.callStack.append(self.pc)
    self.pc = location - 1

  def returnSubFlag(self, flag):
    if self.getFlag(flag):
      self.returnSub()
      
  def returnSub(self):
    if len(self.callStack) > 0:
      self.pc = self.callStack.pop()