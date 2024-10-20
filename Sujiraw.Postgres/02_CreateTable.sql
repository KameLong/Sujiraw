drop table Company;
drop table Station;
drop table TrainType;
drop table Route;
drop table RouteStation;
drop table Train;
drop table Trip;
drop table StopTime;

drop table TimeTable;
drop table TimeTableStation;



CREATE TABLE IF NOT EXISTS Company (
    companyID bigint PRIMARY KEY not null,
    name text not null default '',
    userID text not null default ''

);

CREATE TABLE IF NOT EXISTS Station (
    StationID bigint PRIMARY KEY not null,
    CompanyID bigint not null,
    Name text not null default '',
    ShortName text not null default '', 
    Lat real not null default 35,
    Lon real not null default 135
);

CREATE TABLE IF NOT EXISTS TrainType (
    TrainTypeID bigint PRIMARY KEY not null,
    CompanyID bigint not null,
    Name text not null default '',
    ShortName text not null default '', 
    Color text not null default '#000000',
    FontBold bool not null default FALSE,
    FontItalic bool not null default FALSE,
    LineBold bool not null default FALSE,
    LineDashed bool not null default FALSE
);

CREATE TABLE IF NOT EXISTS Route (
    RouteID bigint PRIMARY KEY not null,
    CompanyID bigint not null,
    Name text not null default '',
    Color text not null default '#000000'
);

CREATE TABLE IF NOT EXISTS RouteStation (
    RouteStationID bigint PRIMARY KEY not null,
    RouteID bigint not null,
    StationID bigint not null,
    Sequence int not null default 0,
    ShowStyle  int not null default 'x0000000101'::bit(16)::int
);

CREATE TABLE IF NOT EXISTS Train (
    TrainID bigint PRIMARY KEY not null,
    CompanyID bigint not null,
    DepStationID bigint not null default -1,
    AriStationID bigint not null default -1,
    DepTime  int not null default -1,
    AriTime  int not null default -1
);
CREATE TABLE IF NOT EXISTS Trip (
    TripID bigint PRIMARY KEY not null,
    RouteID bigint not null,
    TrainID bigint not null,
    TrainTypeID bigint not null,
    Direction int not null default 0,
    TripSeq int not null default 0,

    Name text not null default '',
    Number text not null default '',
    Comment text not null default '',



    DepStationID bigint not null default -1,
    AriStationID bigint not null default -1,
    DepTime  int not null default -1,
    AriTime  int not null default -1
);

CREATE TABLE IF NOT EXISTS StopTime (
    TripID bigint not null,
    Sequence  int not null default -1,
    DepTime  int not null default -1,
    AriTime  int not null default -1,
    StopType  int not null default -1
);


CREATE TABLE IF NOT EXISTS TimeTable (
    TimeTableID bigint PRIMARY KEY not null,
    CompanyID bigint not null,
    Name text not null default '',
    Color text not null default '#000000'
);
CREATE TABLE IF NOT EXISTS TimeTableStation (
    TimeTableStationID bigint PRIMARY KEY not null,
    TimeTableID bigint not null,
    AriRouteStationID bigint not null,
    DepRouteStationID bigint not null,
    Sequence int not null default 0,
    ShowStyle  int not null default 'x0000000101'::bit(16)::int
);



delete from Company;
delete from Station;
delete from TrainType;
delete from Route;
delete from RouteStation;
delete from Train;
delete from Trip;
delete from StopTime;

delete from TimeTable;
delete from TimeTableStation;





