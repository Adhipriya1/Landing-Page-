import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

let books = [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee" },
  { id: 2, title: "1984", author: "George Orwell" },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald" }
];

let nextId = 4;

app.get('/', (req, res) => {
  res.json({
    message: "Welcome to Book API",
    endpoints: {
      "GET /books": "Get all books",
      "GET /books/:id": "Get a specific book",
      "POST /books": "Create a new book",
      "PUT /books/:id": "Update a book",
      "DELETE /books/:id": "Delete a book"
    }
  });
});

app.get('/books', (req, res) => {
  res.json({
    success: true,
    count: books.length,
    data: books
  });
});

app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book with id ${id} not found`
    });
  }

  res.json({
    success: true,
    data: book
  });
});

app.post('/books', (req, res) => {
  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      success: false,
      message: "Title and author are required"
    });
  }

  const newBook = {
    id: nextId++,
    title,
    author
  };

  books.push(newBook);

  res.status(201).json({
    success: true,
    message: "Book created successfully",
    data: newBook
  });
});

app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author } = req.body;

  const bookIndex = books.findIndex(b => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Book with id ${id} not found`
    });
  }

  if (!title && !author) {
    return res.status(400).json({
      success: false,
      message: "Title or author must be provided"
    });
  }

  if (title) books[bookIndex].title = title;
  if (author) books[bookIndex].author = author;

  res.json({
    success: true,
    message: "Book updated successfully",
    data: books[bookIndex]
  });
});

app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Book with id ${id} not found`
    });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];

  res.json({
    success: true,
    message: "Book deleted successfully",
    data: deletedBook
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Try visiting http://localhost:${PORT}/books`);
});
