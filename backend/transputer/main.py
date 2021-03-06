from flask import Blueprint, jsonify, request
from flask_cors import CORS

from random import sample

from transputer.cpu.assembler import Assembler
from transputer.cpu.cpu import CPU
from transputer.cpu.extra import Memory, IO
from transputer.tasks import tasks

transputerapi = Blueprint("transputerapi", __name__, url_prefix = "/transputer-api")
CORS(transputerapi, max_age=30*86400)

@transputerapi.route('/tasks')
def getTasks():
  return jsonify(list(map(lambda task, taskId: {'id': taskId, 'title': task.title}, tasks, range(len(tasks)))))

@transputerapi.route('/task')
def getTask():
  taskId = int(request.args.get('id'))
  
  task = tasks[taskId].get()
  task.update({'id': taskId})
  
  return jsonify(task)

""" @transputerapi.route('/assemble', methods = ['POST'])
def assemble():
  program = request.json.get('cpucode')
  
  assembler = Assembler()
  
  errorList = []
  for cpuCode in program:
    instructionStack = assembler.assemble(cpuCode)
    errorList.append(instructionStack['errors'])
  
  return jsonify(errorList) """

@transputerapi.route('/emulate', methods = ['POST'])
def emulate():
  taskId = request.json.get('task')
  program = request.json.get('cpucode')
  task = tasks[taskId]

  assembler = Assembler()
  assembled, errorList = [], []
  assemblyFailed = False
  for cpuCode in program:
    instructionStack = assembler.assemble(cpuCode)
    errorList.append(instructionStack['errors'])
    if len(instructionStack['errors']) > 0: assemblyFailed = True
    assembled.append(instructionStack)

  if assemblyFailed:
    return jsonify({
      'assemblyFailed': True,
      'assemblyErrors': errorList
    })
    
  
  cpus, memory, io, programStates = emulateTask(assembled, task, output=True)
  
  #Test if right
  passedTest = False
  passedHiddenTest = False
  if io.outputs == task.outputs:
    passedTest = True
    #Check hidden test
    cpusH, memoryH, ioH = emulateTask(assembled, task, useHidden=True)
    
    if ioH.outputs == task.hiddenOutputs:
      passedHiddenTest = True
  
  return jsonify({
    'assemblyFailed': False,
    'hitCycleLimit': len(programStates) == CYCLE_LIMIT,
    'passedTest': passedTest,
    'passedHiddenTest': passedHiddenTest,
    'programStates': programStates,
  })
  
CYCLE_LIMIT = 1000
  
def emulateTask(assembledProgram, task, useHidden=False, output=False):
  memory = Memory(16)
  if useHidden:
    io = IO(task.hiddenInputs.copy())
  else:
    io = IO(task.inputs.copy())
  
  cpus = []
  
  for cpuCode in assembledProgram:
    cpu = CPU(memory, io)
    cpu.loadInstructionStack(cpuCode['instructions'])
    cpu.line = cpuCode['firstLine']
    cpus.append(cpu)
  
  programStates = []
  
  cycle = 0
  done = False
  while not done and cycle < CYCLE_LIMIT:
    cpuStates = []
    memoryStates = []
     
    memory.commit()
    
    if output: 
      ioSave = io.freeze()
 
      #Freeze
      for cpu in cpus:
        cpuStates.append(
          freezeCpuState(cpu)
        )
 
    #Cycle
    done = True
    for cpu in sample(cpus, len(cpus)):
      if not cpu.outOfInstructions and cpu.on:
        done = False
        cpu.cycle()
      
    if output: 
      programStates.append({
        'cpus': cpuStates,
        'memory': memory.freeze(),
        'io': ioSave
      })
    
    cycle += 1
    
  if output: 
    return cpus, memory, io, programStates
  else:
    return cpus, memory, io
  
def freezeCpuState(cpu):
  return {
    'pc': cpu.pc,
    'registers': [
      cpu.registers[0].read(), 
      cpu.registers[1].read(), 
      cpu.registers[2].read(), 
      cpu.registers[3].read(),
    ],
    'flags': {
      'carry': cpu.flags['C'], 
      'zero': cpu.flags['Z']
    },
    'line': cpu.line
  }
