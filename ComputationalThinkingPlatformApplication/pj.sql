DROP TABLE IF EXISTS user;

create table learning_record
(
    id       int auto_increment
        primary key,
    userid   int          null,
    scene    varchar(100) null,
    progress varchar(100) null
);

create table user
(
    id         int auto_increment
        primary key,
    username   varchar(100) null,
    email      varchar(100) null,
    password   varchar(100) null,
    zonepassed int          null
);

