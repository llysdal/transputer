import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-manual',
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.scss']
})
export class ManualComponent implements OnInit {
  
  syntaxes = [
    {
      'format': 'REG',
      'examples': '$0, $1, $2, $3',
      'description': 'One of the four main registers'
    },
    {
      'format': 'C7',
      'examples': '-105, -3, 127',
      'description': 'A 7 bit signed constant (between -128 and 127)'
    },
    {
      'format': 'C8',
      'examples': '25, 93, &HFB',
      'description': 'An 8 bit constant (between 0 and 255)'
    },
    {
      'format': 'C16',
      'examples': '25, 5325, &HBF3D',
      'description': 'A 16 bit constant (between 0 and 65535)'
    },
    {
      'format': 'LABEL',
      'examples': 'LOOP, LC, START',
      'description': 'A label can stand in for a C16, but must be defined in the program earlier. LABELNAME: defines a label.'
    },
    {
      'format': 'CLABEL',
      'examples': 'CONST, LOOPS, AMT',
      'description': 'A constant label can stand in for a C7, C8 or C16. It must be defined before use by writing LABELNAME: EQU C7/C8/C16.'
    },
    {
      'format': 'LOC',
      'examples': '($0), ($3)',
      'description': 'A RAM location pointed to by a main register.'
    },
    {
      'format': 'FLAG',
      'examples': 'C, NC, Z, NZ',
      'description': 'Flags set by arithmetic operations. Zero is self-explanatory. Carry is set if results are beyond 8 bits.'
    },
    {
      'format': 'REM',
      'examples': ';COMMENT',
      'description': 'A comment is ignored by the assembler.'
    }
  ]

  instructions = [
    {
      'name': 'NOP',
      'args': ['', ''],
      'description': 'Does nothing but use up a cycle.',
    },
    {
      'name': 'GST',
      'args': ['REG', ''],
      'description': 'Pops a value from the input stack, and loads it into a main register.',
    },
    {
      'name': 'PST',
      'args': ['REG', ''],
      'description': 'Pushes a value from a main register to the output stack.',
    },
    {
      'name': 'LD',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Loads a value into a main register, getting the value from the second argument.',
    },
    {
      'name': 'LDI',
      'args': ['REG', 'LOC'],
      'description': 'Loads a RAM value into a main register, incrementing the location after.',
    },
    {
      'name': 'ST',
      'args': ['REG/C8', 'LOC'],
      'description': 'Stores a value into a RAM location.',
    },
    {
      'name': 'STI',
      'args': ['REG/C8', 'LOC'],
      'description': 'Stores a value into a RAM location, incrementing the location after.',
    },
    {
      'name': 'AD',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Adds two values together, storing the result in the main register the first argument names.',
    },
    {
      'name': 'ADC',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Adds two values together, not storing the result anywhere. Used for setting flags.',
    },
    {
      'name': 'SB',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Subtracts the second value from the first, storing the new value in the main register the first argument names.',
    },
    {
      'name': 'SBC',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Subtracts the second value from the first, not storing the result anywhere. Used for setting flags.',
    },
    {
      'name': 'JP',
      'args': ['[FLAG]', 'C16'],
      'description': 'Sets the program counter to a specific address.',
    },
    {
      'name': 'JR',
      'args': ['[FLAG]', 'C7'],
      'description': 'Sets the program counter to a relative address.',
    },
    {
      'name': 'CAL',
      'args': ['[FLAG]', 'C16'],
      'description': 'Calls a subroutine, pushing the current address to the call stack.',
    },
    {
      'name': 'RTN',
      'args': ['[FLAG]', ''],
      'description': 'Returns from a subroutine, popping the new address from the call stack.',
    },
    {
      'name': 'OFF',
      'args': ['', ''],
      'description': 'Turns the CPU executing this instruction off.',
    },
    {
      'name': 'AN',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Logical AND',
    },
    {
      'name': 'ANC',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Logical AND check, doesn\'t store the result.',
    },
    {
      'name': 'NA',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Logical NAND',
    },
    {
      'name': 'NAC',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Logical NAND check, doesn\'t store the result.',
    },
    {
      'name': 'OR',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Logical OR',
    },
    {
      'name': 'ORC',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Logical OR check, doesn\'t store the result.',
    },
    {
      'name': 'XR',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Logical XOR',
    },
    {
      'name': 'XRC',
      'args': ['REG', 'REG/LOC/C8'],
      'description': 'Logical XOR check, doesn\'t store the result.',
    },
    {
      'name': 'ROU',
      'args': ['REG', ''],
      'description': 'Rotate all bits up, setting bit 0 equal to carry bit.',
    },
    {
      'name': 'ROD',
      'args': ['REG', ''],
      'description': 'Rotate all bits down, setting bit 8 equal to carry bit.',
    },
    {
      'name': 'BIU',
      'args': ['REG', ''],
      'description': 'Shifts all bits up, setting bit 0 equal to 0.',
    },
    {
      'name': 'BID',
      'args': ['REG', ''],
      'description': 'Rotate all bits down, setting bit 8 equal to 0.',
    },
    {
      'name': 'INV',
      'args': ['REG', ''],
      'description': 'Inverts all bits.',
    }
  ]

  constructor() { }

  ngOnInit(): void {
   
  }
}
