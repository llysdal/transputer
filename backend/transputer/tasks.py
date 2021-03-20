class Task:
  def __init__(self, name, title, description, inputs, outputs, hiddenInputs, hiddenOutputs):
    self.name = name
    self.title = title
    self.description = description
    self.inputs = inputs
    self.outputs = outputs
    self.hiddenInputs = hiddenInputs
    self.hiddenOutputs = hiddenOutputs
    
  def get(self):
    return {
      'name': self.name,
      'title': self.title,
      'description': self.description,
      'input': self.inputs,
      'output': self.outputs,
    }
    
tasks = [
  Task(
    'intro-1',
    'First Instruction', 
'''The year is 1987, and the end of Moore\'s Law has just arrived. 
Enter the Transputer - the solution to all our problems. 
By utilizing multiple processing units in parallel, we can surpass the performance limit previously set, 
and reach the stars. Before that - you\'ll need to learn the basics. 
The CPUs have many instructions available to them - but the two needed in every program is 
GST (Get STatus) and PST (Put STatus). GST will get one input, and load it into any of the four main registers, 
while PST will take a value from any main register, and output it from the program. 
What do we input from and output to? No need to worry about that! In this simple program, 
the Transputer simply needs to read one input, and send it straight out again.
As a hint, \'GST $0\' will load an input into main register 0.''',
    [42],
    [42],
    [19],
    [19]),
  Task(
    'intro-2',
    'Manipulation', 
'''Hmm... Upon further investigation, it appears your last program could be replaced by simply removing the Transputer
and connecting the input and output wires. We have another machine however, where it would be beneficial to slightly
shift the input, let's say by 10. The AD instruction should be able to help here, but you're the professional.
You are the professional, right?''',
    [83, 158, 210, 8],
    [93, 168, 220, 18],
    [19, 222, 95, 102],
    [29, 232, 105, 112]),
  Task(
    'intro-3',
    'Looping', 
'''A department down the line is complaining about a lack of numbers. 
They've requested that we duplicate some already existing numbers,
and send those off to them. This program will recieve a number, and then the amount of duplicates that need to be sent off.
A concept called 'Looping' should be of use here. A combination of the fact that arithmetic operations such as subtracting
sets the zero-flag if the result is zero, and that the jump instructions (JP and JR) can jump conditionally on a flag.
The relative jump (JR) instruction will jump relatively to the current position. JR -2 will jump 2 instructions back for example, 
while JR Z 25 will jump 25 instructions forward, but only if the Zero-flag is set.
The jump (JP) instruction will jump to a specific instruction, which is often specified by a label. 
JP LOOP would jump to wherever the LOOP label is. In the program, the LOOP label would then have to be defined before.
A label can be defined by writing the labelname followed by a colon on a line. For example LOOP: would define the LOOP label.
Labels can also be constant, defined by LABELNAME: EQU (value).''',
    [57, 9],
    [57, 57, 57, 57, 57, 57, 57, 57, 57],
    [153, 3],
    [153, 153, 153]),
  Task(
    'math-1',
    'Basic Arithmetic', 
'''In an effort to make what is known as a calculator, we are going to need different
arithmetic operations done. Add together two incoming numbers, and output the result.
It might be beneficial to know, that if you read beyond the inputs, you will always read a zero,
and zeroes will never be included in the real input.''',
    [68, 55, 27, 64, 27, 200, 94, 150, 83, 126, 132, 117, 140, 93, 6, 100],
    [123, 91, 227, 244, 209, 249, 233, 106],
    [17, 78, 22, 153, 85, 3, 24, 72, 77, 146, 209, 26, 142, 60, 163, 33],
    [95, 175, 88, 96, 223, 235, 202, 196]),
  Task(
    'math-2',
    'Even More Arithmetic', 
    'Multiply together two incoming numbers, and output the result.',
    [13, 7, 11, 15, 3, 11, 7, 4, 15, 11, 3, 1, 15, 9, 2, 9],
    [91, 165, 33, 28, 165, 3, 135, 18],
    [10, 4, 14, 6, 7, 7, 2, 4, 15, 15, 4, 4, 15, 13, 16, 11],
    [40, 84, 49, 8, 225, 16, 195, 176]),
  Task(
    'math-3',
    'Division', 
    'Divide the first number by the second, and then start over on the next two.',
    [56, 4, 224, 14, 32, 8, 182, 14, 90, 10, 54, 9, 6, 2, 4, 1],
    [14, 16, 4, 13, 9, 6, 3, 4],
    [26, 2, 80, 8, 105, 15, 15, 1, 90, 6, 36, 4, 45, 5, 28, 4],
    [13, 10, 7, 15, 15, 9, 9, 7]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
  Task(
    '',
    'None', 
    '',
    [],
    [256],
    [],
    [256]),
]