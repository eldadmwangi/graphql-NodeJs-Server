const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const app = express();

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

const authors = [
  { id: 1, name: "J.K.Rowling" },
  { id: 2, name: "J.R.Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Porter and the chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Porter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "HARRY porter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

//Create the main RootQuerry qhich defines the various queries//
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    //querry for books//
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books",
      resolve: () => books,
    },
    //query fo a single book now based on the arguments id //
    book: {
      type: BookType,
      description: "A single book here",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    //Querry for all authors//
    authors: {
      type: new GraphQLList(AuthorInfo),
      description: "Alist of Authors",
      resolve: () => authors,
    },
    //a querry for an individual author based on id//
    author: {
      type: AuthorInfo,
      description: "A single Author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
});

//This is the individual book and its fields//
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This is an authers Book",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLInt) },
    //here we get the books author//
    author: {
      type: AuthorInfo,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

const AuthorInfo = new GraphQLObjectType({
  name: "Author",
  description: "This is the author",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

//Creating a RootMutation//
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Add a book",
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        //creating a new book with an id and the name and author id as defined above//
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        //now pushing the book into the books array//
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorInfo,
      description: "Add an Author",
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        //creating a new author with an id and the name as defined above//
        const author = { id: authors.length + 1, name: args.name };
        //now pushing the author into the authors array//
        authors.push(author);
        return author;
      },
    },
  }),
});

//her the schema takes querries and mutation as they are defined in the roottypes//
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: "Helloworld",
//     fields: () => ({
//       message: {
//         type: GraphQLString,
//         resolve: () => "Hello there World",
//       },
//     }),
//   }),
// });

app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema: schema,
  })
);

app.listen(5000, console.log("server is running here"));
