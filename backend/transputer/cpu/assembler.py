from .types import isInt, isHex, is7Bit, is8Bit, is16Bit, isString, isRegister, isLocation, isFlag, isNegativeFlag, isLabel, isComment
from .cpu import CPU
from enum import Enum

#parameter types
class Param(Enum):
  C7 = 'C7'
  C8 = 'C8'
  C16 = 'C16'
  REG = 'REG'
  LOC = 'LOC'
  FLAG = 'FLAG'

class Assembler:
  def __init__(self):
    self.cd = {
      'NOP': (CPU.noOperation, ()),
      'GRE': (CPU.getStatus, ((Param.REG,),)),
      'PRE': (CPU.putStatus, ((Param.REG,),)),
      'LD':  (CPU.load, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'LDI': (CPU.loadIncrement, ((Param.REG,), (Param.LOC,))),
      'ST':  (CPU.store, ((Param.REG, Param.C8), (Param.LOC,))),
      'STI': (CPU.storeIncrement, ((Param.REG, Param.C8), (Param.LOC,))),
      'AD':  (CPU.add, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'ADC': (CPU.addCheck, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'SB':  (CPU.sub, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'SBC': (CPU.subCheck, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'JP':  (CPU.jumpFlag, ((Param.FLAG,), (Param.C16,))),
      'JR':  (CPU.jumpRelativeFlag, ((Param.FLAG,), (Param.C7,))),
      'CAL': (CPU.callSubFlag, ((Param.FLAG,), (Param.C16,))),
      'RTN': (CPU.returnSubFlag, ((Param.FLAG,),)),
      'OFF': (CPU.turnOff, ()),
      'AN':  (CPU.logicalAnd, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'NA':  (CPU.logicalNand, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'OR':  (CPU.logicalOr, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'XR':  (CPU.logicalXor, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'ANC': (CPU.logicalAndCheck, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'NAC': (CPU.logicalNandCheck, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'ORC': (CPU.logicalOrCheck, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'XRC': (CPU.logicalXorCheck, ((Param.REG,), (Param.REG, Param.LOC, Param.C8))),
      'ROU': (CPU.rotateUp, ((Param.REG,),)),
      'ROD': (CPU.rotateDown, ((Param.REG,),)),
      'BIU': (CPU.bitUp, ((Param.REG,),)),
      'BID': (CPU.bitDown, ((Param.REG,),)),
      'INV': (CPU.invert, ((Param.REG,),)),
    }

  def getLabels(self, code):
    #Label pass
    lineNumber = 0
    pc = 0
    labels = {}
    errors = []
    for line in code.split('\n'):
      withoutComments = line.strip().split(';')[0]
      words = withoutComments.strip().split(' ')
      key = words[0].upper()

      if key == '':
        #Blank
        pass
      elif isLabel(key):
        #Label
        args = words[1:]
        
        #Remove empty
        while '' in args:
          args.remove('')

        if not args:
          labels[key[0:-1]] = pc
        else:
          if args[0].upper() != 'EQU' or len(args) != 2:
            errors.append({
              'error': 'UNKNOWN SYNTAX',
              'code': None,
              'solution': None,
              'line': lineNumber,
            })
            lineNumber += 1
            continue

          if isInt(args[1]):
            labels[key[0:-1]] = int(args[1])
          elif isHex(args[1]):
            labels[key[0:-1]] = int(args[1][2:], 16)
          else:
            errors.append({
              'error': 'UNKNOWN CONSTANT',
              'code': args[1].upper(),
              'solution': None,
              'line': lineNumber,
            })
            lineNumber += 1
            continue
      else:
        pc += 1
      lineNumber += 1

    return labels, errors
  
  def assemble(self, code):
    labels, errors = self.getLabels(code)

    firstLine = -1
    lineNumber = 0
    instructionStack = []
    for line in code.split('\n'):
      withoutComments = line.strip().split(';')[0]
      words = withoutComments.strip().split(' ')
      key = words[0].upper()

      if key == '':
        #Blank
        pass
      elif isLabel(key):
        #Label
        pass
      else:
        #Set first line
        if firstLine == -1:
          firstLine = lineNumber
        
        #Instruction
        args = words[1:]
      
        #Remove empty
        while '' in args:
          args.remove('')
        
        if key not in self.cd:
          errors.append({
            'error': 'UNKNOWN INSTRUCTION',
            'code': key.upper(),
            'solution': None,
            'line': lineNumber,
          })
          lineNumber += 1
          continue
        
        closure = self.cd[key]
        
        #Manual override for JP JR CAL and RTN (optional flag)
        if len(args) + 1 == len(closure[1]):
          if key.upper() == 'JP':
            closure = (CPU.jump, ((Param.C16,),))
          elif key.upper() == 'JR':
            closure = (CPU.jumpRelative, ((Param.C7,),))
          elif key.upper() == 'CAL':
            closure = (CPU.callSub, ((Param.C16,),))
          elif key.upper() == 'RTN':
            closure = (CPU.returnSub, ())
        
        if len(args) != len(closure[1]):
          errors.append({
            'error': 'INVALID ARGUMENT AMOUNT',
            'code': args,#key.upper(),
            'solution': len(closure[1]),
            'line': lineNumber,
          })
          lineNumber += 1
          continue
          
        argList = []
        for arg, types in zip(args, closure[1]):
          label = arg.upper()
          #Constants
          if Param.C8 in types and is8Bit(arg):
            if isInt(arg):
              argList.append(int(arg))
            else:
              argList.append(int(arg[2:], 16))
          elif Param.C16 in types and is16Bit(arg):
            if isInt(arg):
              argList.append(int(arg))
            else:
              argList.append(int(arg[2:], 16))
          elif Param.C7 in types and is7Bit(arg):
            if isInt(arg):
              argList.append(int(arg))
            else:
              argList.append(int(arg[2:], 16))
          #Labels
          elif Param.C8 in types and label in labels and 0 <= labels[label] <= 255:
            argList.append(labels[label])
          elif Param.C16 in types and label in labels and 0 <= labels[label] <= 65535:
            argList.append(labels[label])
          #Registers
          elif Param.REG in types and isRegister(arg):
            argList.append(arg)
          elif Param.LOC in types and isLocation(arg):
            argList.append(arg)
          #Flags
          elif Param.FLAG in types and isFlag(arg.upper()):
            argList.append(arg.upper())
          else:
            errors.append({
              'error': 'INVALID ARGUMENT',
              'code': arg.upper(),
              'solution': ", ".join([t.value for t in types]),
              'line': lineNumber,
            })
            continue
            
        instructionStack.append(
          {
            'instruction': closure[0],
            'args': argList,
            'line': lineNumber
          }
        )
      
      lineNumber += 1
      
    if errors:
      return {
        'errors': errors,
        'instructions': [],
        'firstLine': 0
      }
    else:
      return {
        'errors': [],
        'instructions': instructionStack,
        'firstLine': firstLine
      }