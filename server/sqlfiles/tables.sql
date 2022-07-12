CREATE TABLE users (
	uid VARCHAR(10) NOT NULL,
	uusername TINYTEXT NOT NULL,
	upassword TINYTEXT NOT NULL,
	uranking INT NOT NULL,
	uemail TINYTEXT,
	uverified INT NOT NULL,
	PRIMARY KEY (uid)
) ENGINE = InnoDB;

CREATE TABLE refreshtokens (
	uid VARCHAR(10) NOT NULL,
	rtoken TEXT(500) NOT NULL,
	PRIMARY KEY (uid, rtoken(500)),
	FOREIGN KEY (uid) REFERENCES users(uid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE friends (
	frid INT AUTO_INCREMENT,
	uidone VARCHAR(10) NOT NULL,
	uidtwo VARCHAR(10) NOT NULL,
	frstatus INT NOT NULL,
	PRIMARY KEY (frid),
	FOREIGN KEY (uidone) REFERENCES users(uid)
	ON DELETE CASCADE,
	FOREIGN KEY (uidtwo) REFERENCES users(uid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE verificationkeys (
	uid VARCHAR(10) NOT NULL,
	vkkey TEXT NOT NULL,
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES users(uid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE notifications (
	nid INT NOT NULL AUTO_INCREMENT,
	uid VARCHAR(10) NOT NULL,
	coid VARCHAR(10),
	ntitle TINYTEXT NOT NULL,
	nmessage TEXT NOT NULL,
	nurl TEXT NOT NULL,
	ntime DATETIME NOT NULL,
	PRIMARY KEY (nid),
	FOREIGN KEY (uid) REFERENCES users(uid)
	ON DELETE CASCADE,
	FOREIGN KEY (coid) REFERENCES collectors(coid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE collectors (
	coid VARCHAR(10) NOT NULL,
	uid VARCHAR(10) NOT NULL,
	coname TEXT NOT NULL,
	PRIMARY KEY (coid),
	FOREIGN KEY (uid) REFERENCES users (uid)
) ENGINE = InnoDB;

CREATE TABLE collectorfavorites (
	coid VARCHAR(10) NOT NULL,
	uid VARCHAR(10) NOT NULL,
	PRIMARY KEY (coid, uid),
	FOREIGN KEY (coid) REFERENCES collectors (coid)
	ON DELETE CASCADE,
	FOREIGN KEY (uid) REFERENCES users (uid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE collectorsettings (
	coid VARCHAR(10) NOT NULL,
	coskey VARCHAR(255) NOT NULL,
	cosvalue TINYTEXT,
	PRIMARY KEY (coid, coskey),
	FOREIGN KEY (coid) REFERENCES collectors(coid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE cardtypes (
	ctid VARCHAR(10) NOT NULL,
	coid VARCHAR(10) NOT NULL,
	ctname TINYTEXT NOT NULL,
	PRIMARY KEY (ctid),
	FOREIGN KEY (coid) REFERENCES collectors(coid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE cards (
	cid VARCHAR(10) NOT NULL,
	coid VARCHAR(10) NOT NULL,
	cname TINYTEXT NOT NULL,
	ctid VARCHAR(10) NOT NULL,
	cimage TINYTEXT NOT NULL,
	PRIMARY KEY (cid),
	FOREIGN KEY (ctid) REFERENCES cardtypes(ctid)
	ON DELETE RESTRICT,
	FOREIGN KEY (coid) REFERENCES collectors(coid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE cardframes (
	cfid INT NOT NULL,
	coid VARCHAR(10) NOT NULL,
	cfname TINYTEXT NOT NULL,
	cfimagefront TINYTEXT NOT NULL,
	cfimageback TINYTEXT NOT NULL,
	PRIMARY KEY (cfid),
	FOREIGN KEY (coid) REFERENCES collectors(coid)
	ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE cardeffects (
	ceid INT NOT NULL,
	coid VARCHAR(10) NOT NULL,
	ceimage TINYTEXT NOT NULL,
	ceopacity FLOAT NOT NULL,
	PRIMARY KEY (ceid),
	FOREIGN KEY (coid) REFERENCES collectors(coid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE cardunlocks (
	cuid VARCHAR(10) NOT NULL,
	uid VARCHAR(10) NOT NULL,
	cid VARCHAR(10) NOT NULL,
	cfid INT NOT NULL,
	cuquality INT NOT NULL,
	culevel INT NOT NULL,
	PRIMARY KEY (cuid),
	FOREIGN KEY (uid) REFERENCES users(uid)
	ON DELETE CASCADE,
	FOREIGN KEY (cid) REFERENCES cards(cid)
	ON DELETE CASCADE,
	FOREIGN KEY (cfid) REFERENCES cardframes(cfid)
	ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE trades (
	tid VARCHAR(10) NOT NULL,
	coid VARCHAR(10) NOT NULL,
	uidone VARCHAR(10) NOT NULL,
	uidtwo VARCHAR(10) NOT NULL,
	tstatusone INT NOT NULL,
	tstatustwo INT NOT NULL,
	tlasttrade DATETIME,
	PRIMARY KEY(tid),
	FOREIGN KEY (coid) REFERENCES collectors(coid)
	ON DELETE CASCADE,
	FOREIGN KEY (uidone) REFERENCES users(uid)
	ON DELETE CASCADE,
	FOREIGN KEY (uidtwo) REFERENCES users(uid)
	ON DELETE CASCADE,
	UNIQUE(uidone, uidtwo)
) ENGINE = InnoDB;

CREATE TABLE tradecards (
	tid VARCHAR(10) NOT NULL,
	cuid VARCHAR(10) NOT NULL,
	PRIMARY KEY (tid, cuid),
	FOREIGN KEY (tid) REFERENCES trades(tid)
	ON DELETE CASCADE,
	FOREIGN KEY (cuid) REFERENCES cardunlocks(cuid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE tradesuggestions (
	tid VARCHAR(10) NOT NULL,
	cuid VARCHAR(10) NOT NULL,
	PRIMARY KEY(tid, cuid),
	FOREIGN KEY (tid) REFERENCES trades(tid)
	ON DELETE CASCADE,
	FOREIGN KEY (cuid) REFERENCES cardunlocks(cuid)
	ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE packstats (
        psid INT NOT NULL AUTO_INCREMENT,
        coid VARCHAR(10),
        uid VARCHAR(10),
        pstime DATETIME NOT NULL,
        PRIMARY KEY (psid),
        FOREIGN KEY (coid) REFERENCES collectors(coid)
		ON DELETE SET NULL,
        FOREIGN KEY (uid) REFERENCES users(uid)
		ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE TABLE packtimes (
        uid VARCHAR(10) NOT NULL,
        coid VARCHAR(10) NOT NULL,
        ptlastopened DATETIME,
        PRIMARY KEY (uid),
        FOREIGN KEY (uid) REFERENCES users(uid)
		ON DELETE CASCADE,
        FOREIGN KEY(coid) REFERENCES collectors(coid)
		ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE achievementypes (
       attype VARCHAR(255) NOT NULL,
       PRIMARY KEY (attype)
) ENGINE = InnoDB;

CREATE TABLE achievements (
        aid VARCHAR(10) NOT NULL,
        coid VARCHAR(10),
        aimage TEXT NOT NULL,
        atext TEXT NOT NULL,
        PRIMARY KEY (aid),
        FOREIGN KEY(coid) REFERENCES collectors(coid)
		ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE achievementconditions (
        aid VARCHAR(10) NOT NULL,
        attype VARCHAR(255) NOT NULL,
        PRIMARY KEY(aid, attype),
        FOREIGN KEY(aid) REFERENCES achievements(aid)
		ON DELETE CASCADE,
        FOREIGN KEY(attype) REFERENCES achievementypes(attype)
		ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE achievementunlocks (
        uid VARCHAR(10) NOT NULL,
        aid VARCHAR(10) NOT NULL,
        PRIMARY KEY (uid, aid),
        FOREIGN KEY (uid) REFERENCES users(uid)
		ON DELETE CASCADE,
        FOREIGN KEY (aid) REFERENCES achievements(aid)
		ON DELETE CASCADE
) ENGINE = InnoDB;
