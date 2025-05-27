export const languageConfigs = {
  python: {
    name: 'Python',
    extension: '.py',
    defaultCode: `print("Hello, world!")

# Get user input
name = input("Enter your name: ")
print(f"Hello, {name}!")`
  },
  javascript: {
    name: 'JavaScript',
    extension: '.js',
    defaultCode: `console.log("Hello, world!");

// Get user input (Node.js readline simulation)
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your name: ', (name) => {
  console.log(\`Hello, \${name}!\`);
  rl.close();
});`
  },
  java: {
    name: 'Java',
    extension: '.java',
    defaultCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
        
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}`
  },
  cpp: {
    name: 'C++',
    extension: '.cpp',
    defaultCode: `#include <iostream>
#include <string>

int main() {
    std::cout << "Hello, world!" << std::endl;
    
    std::string name;
    std::cout << "Enter your name: ";
    std::getline(std::cin, name);
    std::cout << "Hello, " << name << "!" << std::endl;
    
    return 0;
}`
  }
};

export const codeSamples = {
  hello: {
    python: `print("Hello, world!")

# Get user input
name = input("Enter your name: ")
print(f"Hello, {name}!")`,
    javascript: `console.log("Hello, world!");

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your name: ', (name) => {
  console.log(\`Hello, \${name}!\`);
  rl.close();
});`,
    java: `import java.util.Scanner;

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
        
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}`,
    cpp: `#include <iostream>
#include <string>

int main() {
    std::cout << "Hello, world!" << std::endl;
    
    std::string name;
    std::cout << "Enter your name: ";
    std::getline(std::cin, name);
    std::cout << "Hello, " << name << "!" << std::endl;
    
    return 0;
}`
  },
  calculator: {
    python: `# Simple calculator
print("Simple Calculator")
print("Operations: +, -, *, /")

while True:
    try:
        num1 = float(input("Enter first number: "))
        op = input("Enter operator (+, -, *, /): ")
        num2 = float(input("Enter second number: "))
        
        if op == '+':
            result = num1 + num2
        elif op == '-':
            result = num1 - num2
        elif op == '*':
            result = num1 * num2
        elif op == '/':
            if num2 == 0:
                print("Error: Division by zero")
                continue
            result = num1 / num2
        else:
            print("Invalid operator")
            continue
        
        print(f"Result: {num1} {op} {num2} = {result}")
        
        again = input("Calculate again? (y/n): ")
        if again.lower() != 'y':
            break
    except ValueError:
        print("Please enter valid numbers")

print("Thank you for using the calculator!")`,
    javascript: `// Simple calculator
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Simple Calculator");
console.log("Operations: +, -, *, /");

function calculate() {
  rl.question('Enter first number: ', (num1) => {
    rl.question('Enter operator (+, -, *, /): ', (op) => {
      rl.question('Enter second number: ', (num2) => {
        const n1 = parseFloat(num1);
        const n2 = parseFloat(num2);
        let result;
        
        switch(op) {
          case '+': result = n1 + n2; break;
          case '-': result = n1 - n2; break;
          case '*': result = n1 * n2; break;
          case '/': 
            if (n2 === 0) {
              console.log("Error: Division by zero");
              calculate();
              return;
            }
            result = n1 / n2; 
            break;
          default:
            console.log("Invalid operator");
            calculate();
            return;
        }
        
        console.log(\`Result: \${n1} \${op} \${n2} = \${result}\`);
        
        rl.question('Calculate again? (y/n): ', (again) => {
          if (again.toLowerCase() === 'y') {
            calculate();
          } else {
            console.log("Thank you for using the calculator!");
            rl.close();
          }
        });
      });
    });
  });
}

calculate();`
  },
  factorial: {
    python: `# Factorial calculation
def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n-1)

while True:
    try:
        num = int(input("Enter a number to calculate factorial (0 to exit): "))
        if num < 0:
            print("Please enter a non-negative number")
            continue
        if num == 0:
            print("Exiting program")
            break
            
        result = factorial(num)
        print(f"The factorial of {num} is {result}")
    except ValueError:
        print("Please enter a valid integer")
    except RecursionError:
        print("Number too large for recursive calculation")`,
    javascript: `// Factorial calculation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function factorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

function askForNumber() {
  rl.question('Enter a number to calculate factorial (0 to exit): ', (input) => {
    const num = parseInt(input);
    
    if (isNaN(num)) {
      console.log("Please enter a valid integer");
      askForNumber();
      return;
    }
    
    if (num < 0) {
      console.log("Please enter a non-negative number");
      askForNumber();
      return;
    }
    
    if (num === 0) {
      console.log("Exiting program");
      rl.close();
      return;
    }
    
    try {
      const result = factorial(num);
      console.log(\`The factorial of \${num} is \${result}\`);
    } catch (error) {
      console.log("Number too large for calculation");
    }
    
    askForNumber();
  });
}

askForNumber();`
  }
};