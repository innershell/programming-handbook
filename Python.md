https://core-electronics.com.au/guides/python-reference-cheat-sheet/

# Import
```
import time
import math from sqrt
import sendmail from emailer // email
import requests // http
import csv // csv files
import os // file system
import matplotlib.pyplot as plt // charts
```

# Data Types
## Number
```
5
```

## String
```
'I am a string'  
"I am a string"  
```

## Boolean
```
True
False
```
## Collections
There are 4 data types used to store multiple items as a collection of data: List, Tuple, Dictionary, and Set.

| Type | Ordered? | Changeable? | Allow Duplicate? | Indexed? |
|---|---|---|---|---|
| List | Yes | Yes | Yes | Yes |
| Tuple | Yes | No | Yes | Yes |
| Dictionary | Yes | Yes | No | No (key only) |
| Set | No | No | No | No (iterator only) |

### List
```
["apple", "banana", "cherry"]
```
### Tuple
```
("apple", "banana", "cherry")
```
### Dictionary
```
{ "id" : "1234-ABCD", "firstName" : "john" , "lastName" : "smith" }
```
### Set
```
{"apple", "banana", "cherry"}
```

# Variables

```
x = 5
x = 'I am a string now'
x = "I am also a string"
````  

# Operators
```
1+3
1*3
2**3 // integer operation
2//3 // integer operation
1-3
1/3
2%3
x > y
x < y
x <= y
x >= y
x == y
x != y
x | y
x & y
not True
not False
```

# Conditions & Loops
## If-Else If-Else
```
if():
  // code
elif():
  // code
else:
  // code
```
## For Loop
```
for i in range(1,10):
  print(i)
  
for i in myList:
  print(i)
```

## While Loop
```
while (i < 9):
  print(i)
  break
```

# Functions
## Definition
```
def functionName(parameter):
  return (parameter)
```

## Lambda Function
Basically an arrow function in JavaScript.
```
return = lambda a : a + 1
```

# Classes
```
class myClass:
  def __init__(self, x, y):
    self.input1 = x
    self.input2 = y
  def myClassMethod(self):
    return self.input1 + self.input2
```
# Samples
## HTTP Get
```
r = requests.get(i_file_url, auth=(USERNAME,PASSWORD))
```

## Read a File
```
with open(os.getcwd() + '/input-jira.csv', 'wb') as f: f.write(r.content)
with open('input-jira.csv', newline='') as csv_file:
  csv_file = csv.reader(csv_file, delimiter=',')
  for x in csv_file: jira_list.append(x) #Create a list object.
```

## Write a File
```
with open(OUTPUT_CSV, mode='w') as export_file:
  file_writer = csv.writer(export_file, delimiter=',',quotechar='"', quoting=csv.QUOTE_MINIMAL)
  file_writer.writerow(["Sprint Name", "Planned Points", "Finished Points", "Remaining Points"])
  for x in sprint_summary:
    file_writer.writerow(x)
```

## Plot a Chart
```
plt.figure(figsize=(12,6))
plt.title(i_title)
plt.xlabel("Sprint/Finish Date")
plt.ylabel("Story Points")
plt.bar(x_sprints, y_remaining, color = '#587CA1', label="Remaining")
plt.bar(x_sprints, y_finished, color = '#E3ECB8', bottom = y_remaining, label="Finished")
plt.legend()
plt.savefig(OUTPUT_PNG)
```
