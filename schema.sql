show tables;

CREATE table user(
  id int ,
  username varchar(30) unique,
  email varchar(80) unique,
  password varchar(20) NOT NULL
);