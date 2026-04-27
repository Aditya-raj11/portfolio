# The Essential CSE Tech Handbook

This guide covers the core commands and concepts every Computer Science Engineering student should master, ranging from Database Management (SQL) to Version Control and System Administration.

---

## 1. Database Management (SQL)

Structured Query Language (SQL) is used for managing and manipulating relational databases.

### A. Data Definition Language (DDL)
*Used for defining database schemas.*

- **CREATE**: Create a new table or database.
  ```sql
  CREATE TABLE Students (ID int, Name varchar(255), Major varchar(100));
  ```
- **ALTER**: Modify an existing table structure.
  ```sql
  ALTER TABLE Students ADD GPA decimal(3,2);
  ```
- **DROP**: Delete a table or database.
  ```sql
  DROP TABLE Students;
  ```

### B. Data Manipulation Language (DML)
*Used for managing data within the tables.*

- **INSERT**: Add rows to a table.
  ```sql
  INSERT INTO Students (ID, Name, Major) VALUES (1, 'Aditya', 'CSE');
  ```
- **SELECT**: Retrieve data. (The most used command).
  ```sql
  SELECT * FROM Students WHERE Major = 'CSE';
  ```
- **UPDATE**: Modify existing records.
  ```sql
  UPDATE Students SET Major = 'AI/ML' WHERE ID = 1;
  ```
- **DELETE**: Remove rows.
  ```sql
  DELETE FROM Students WHERE ID = 1;
  ```

### C. Advanced SQL Functions
- **JOIN**: Combine rows from two or more tables.
  ```sql
  SELECT Students.Name, Grades.Score 
  FROM Students 
  INNER JOIN Grades ON Students.ID = Grades.StudentID;
  ```
- **GROUP BY**: Aggregate data.
  ```sql
  SELECT Major, AVG(GPA) FROM Students GROUP BY Major;
  ```

---

## 2. Version Control (Git)

Git is essential for collaborative software development.

- **`git init`**: Initialize a local repository.
- **`git clone <url>`**: Copy a remote repository to your machine.
- **`git add .`**: Stage all changes for commit.
- **`git commit -m "message"`**: Save your staged changes with a description.
- **`git push`**: Upload changes to a remote server (like GitHub).
- **`git pull`**: Download and merge changes from the remote server.
- **`git branch`**: Create or list development branches.
- **`git merge <branch>`**: Combine work from different branches.

---

## 3. Operating Systems & Linux (Bash)

Most servers and modern dev environments run on Linux.

- **`ls`**: List directory contents.
- **`cd <dir>`**: Change directory.
- **`mkdir <name>`**: Create a new folder.
- **`grep`**: Search for text patterns within files (Powerful for debugging logs).
- **`chmod`**: Change file permissions (Essential for security logic).
- **`top`**: View real-time system resource usage (CPU/RAM).
- **`ssh <user>@<ip>`**: Connect to a remote server securely.

---

## 4. Key CSE Fundamentals

### Data Structures & Algorithms (DSA)
- **Time Complexity:** The measure of how an algorithm's runtime grows with input size ($O(n)$, $O(\log n)$, etc.).
- **Arrays vs. Linked Lists:** Static vs. Dynamic memory allocation.
- **Trees & Graphs:** Used for hierarchical data and network routing.

### Computer Networking
- **TCP/IP:** The protocol suite of the internet.
- **HTTP/HTTPS:** The foundation of web communication.
- **DNS:** Translating human-friendly names (google.com) to IP addresses.

### Software Engineering Patterns
- **DRY (Don't Repeat Yourself):** Minimizing code duplication.
- **SOLID Principles:** Five design principles for making software more understandable and flexible.
- **MVC (Model-View-Controller):** The architecture used in many web frameworks (including this portfolio's feature logic).

---

## 5. Web Development Workflow (For this Portfolio)

- **`npm install`**: Downloads the dependencies (libraries) mentioned in `package.json`.
- **`npm run dev`**: Starts a local development server.
- **`npm run build`**: Compiles the code into optimized files for production.
- **`firebase deploy`**: Push the built files to the live internet.
