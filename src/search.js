import React, { Component } from 'react';
import Request from 'superagent';
import _ from 'lodash';
import Highlighter from 'react-highlight-words'

let goToPage = 0;
let ls_json;

class Search extends Component {

  constructor(){
    super();
    this.state = {
      isFirstPage:true,
      books: [],
      totalItems: null,
      isloadingList: true,
      favBooks: [],
      isFav:false
    };
  }

  // TODO bring these two methods to work as one

  searchBook(query = "brasil", index = "0"){
    let url = `https://www.googleapis.com/books/v1/volumes?startIndex=${index}&q=${query}`;
    Request.get(url).then((response) => {
      this.setState({
        books: response.body.items,
        total: response.body.totalItems,
        isloadingList: false,
      })
    }, () => {
      this.setState({
        requestFailed: true,
        isloadingList: true
      })
    });
  }

  choseenBook(bookId){
    console.log(bookId);
    // TODO change url for retrive uniq book
    //https://www.googleapis.com/books/v1/volumes/${bookId}
    let urlBook = `https://www.googleapis.com/books/v1/volumes?q=${bookId}`;

    Request.get(urlBook).then((response) => {
      this.setState({
        bookClicked: response.body.items
      })
    }, () => {
      this.setState({
        requestFailed: true
      })
    });
  }

  //TODO CHANGE ONCHANGE TO ONSUBMIT, TO AVOID BEING BLOCKED BY GOOGLE BY ASKING LOT OF REQUESTS TO THEM
  updateSearch(e){
    this.searchBook(this.refs.query.value);
  }

  //PAGINATION

  previousPageSearch(page){
    let isFirstPage;
    let searchValue = this.refs.query.value;

    goToPage = goToPage - page;

    if(goToPage < 9){
      isFirstPage = true;
    }else{
      isFirstPage = false;
    }

    console.log(goToPage);

    this.setState({isFirstPage: isFirstPage});
    this.searchBook(searchValue, goToPage);
  }

  nextPageSearch(page){
    let isFirstPage;
    let searchValue = this.refs.query.value;

    goToPage = goToPage + page;

    if(goToPage < 9){
      isFirstPage = true;
    }else{
      isFirstPage = false
    }

    console.log(goToPage, isFirstPage);

    this.setState({isFirstPage: isFirstPage});
    this.searchBook(searchValue, goToPage);
  }

  //FAVORITE METHODS

  saveFavorite(bookId, bookName){
    let favBooks = JSON.parse(localStorage.getItem("ls_favoriteBooks")) || [];
    let exists = false;

    for (var i = 0; i < favBooks.length; i++) {
      if (bookId === favBooks[i].bookId) {
        exists = true;
        console.log('book already exists');
      }
    }

    if (exists === false ) {
      favBooks.push({bookId,bookName});
      localStorage.setItem("ls_favoriteBooks", JSON.stringify(favBooks));
      this.setState({favBooks});
    }
  }

  removeFavorite(bookId){
    let favBooks = JSON.parse(localStorage.getItem("ls_favoriteBooks")) || [];

    for (var i = 0; i < favBooks.length; i++) {
      if (bookId === favBooks[i].bookId) {
        favBooks.splice(i, 1);
      }
    }

    this.setState({favBooks});
    localStorage.setItem("ls_favoriteBooks", JSON.stringify(favBooks));
  }

  //RENDER

  render() {

    let {
      isFirstPage,
      totalItems,
      isloadingList,
      favBooks,
      isFav
    } = this.state;

    // ITEMS OF THE LIST OF BOOKS TO BE SHOWN
    let books = _.map(this.state.books, (book) => {
      return (
        <li className="book-item" ref={book.id} onClick={ (e) => { this.choseenBook(book.id) } }>
        <Highlighter
          highlightClassName='highlight'
          searchWords={[this.refs.query.value]}
          autoEscape={true}
          textToHighlight={ book.volumeInfo.title }
        />
        </li>
      );
    });

    // BOOK DETAILS
    let bookClicked = _.map(this.state.bookClicked, (bookClicked) => {
      // TODO ADD DINAMIC CLASS FOR FAVORITE ICON
      // TODO ADD Loading GIF WHILE IS LOADING CONTENT
      return (
        <div className="book-description">
          <h2>
            <i className={isFav ? 'fa fa-star' : 'fa fa-star-o'} onClick={ (e) => { this.saveFavorite(bookClicked.id, bookClicked.volumeInfo.title) } } aria-hidden="true"></i>
            {bookClicked.volumeInfo.title}
          </h2>
          <h4>{bookClicked.volumeInfo.subtitle}</h4>
          <small>Author: {bookClicked.volumeInfo.authors}</small><br />
          <small>Published in {bookClicked.volumeInfo.publishedDate}</small>
          <hr />
          <p>{bookClicked.volumeInfo.description}</p>
        </div>
      );
    });

    // FAVORITE LIST

    if (JSON.parse(localStorage.getItem("ls_favoriteBooks")) === null) {
      ls_json = favBooks;
    }else{
      ls_json = JSON.parse(localStorage.getItem("ls_favoriteBooks"));
    }

    let favoriteBooksList = ls_json.map(function(favBooks) {
      return (
        <li className="book-item" bookid={favBooks.bookId} onClick={ (e) => { this.choseenBook(favBooks.bookId) } }>
          <span>{ favBooks.bookName }</span>
          <i className="fa fa-trash" aria-hidden="true" onClick={ (e) => {this.removeFavorite(favBooks.bookId) }}></i>
        </li>
      );
    }.bind(this));

    let pagination = (
      <nav className="blog-pagination text-center">
        <a className={"btn btn-outline-primary " + (isFirstPage && ' disabled')} onClick={ (e) => {this.previousPageSearch(10);} }>
          <i className="fa fa-chevron-left" aria-hidden="true"></i> Back
        </a>
        <a className="btn btn-outline-primary" onClick={ (e) => {this.nextPageSearch(10);} }>
          Next <i className="fa fa-chevron-right" aria-hidden="true"></i>
        </a>
      </nav>);


    //ERROR MESSAGES
    let errorDescription;
    if (!this.state.bookClicked) {
      errorDescription = <div><h2>No book selected yet.</h2><br /><p>Please use the search and click in one of the books in the list to see more details about it!</p></div>;
    }

    //Total de Resultados, como a api da google nao e para teste o numero varia pois ha varias pessoas adicionando ou removendo livros com livro.
    //<span>Total de resultados: {Math.round(this.state.total)}</span>

    return (
      <div className="row">
        <div className="col-sm-5 col-md-4">
          <div className="sidebar-module">

            <div className="wrapper">
              <input type="text" className="search-box" placeholder="Search book" onChange={ (e) => { this.updateSearch(); } } ref="query" />
              <i className="fa fa-search" aria-hidden="true"></i>
            </div>

            <ul id="book-list" className="text-left">
              {isloadingList ? (<img className="text-center" src="../img/loading.gif" alt="loading" />) : books}
            </ul>

            {isloadingList === true ? '' : pagination}

          </div>
        </div>
        <div className="col-sm-3 col-md-5">
          <div className="book-main">
            {errorDescription}
            {bookClicked[0]}
          </div>
        </div>
        <div className="col-sm-3 col-md-3">
          <div className="sidebar-module">
            <h2>Favoritos</h2>
            <hr />
            <ul id="book-list" className="text-left">
              {favBooks.length === 0 ? (<p>Click on the <i className="fa fa-star-o"></i> to save a book as favorite</p>) : favoriteBooksList}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Search;
