# Migratation for old databases

For really old databases:

```sql
ALTER TABLE user ADD COLUMN email TEXT NOT NULL, ADD COLUMN verified INT NOT NULL;",
ALTER TABLE trademanager ADD COLUMN cooldown TEXT NOT NULL;"
ALTER TABLE trademanager ADD COLUMN cooldown TEXT NOT NULL;"
ALTER TABLE notification ADD COLUMN time TEXT NOT NULL;"
```

```sql
DROP TABLE animePackTime;
DROP TABLE animePool;
```

## Users

```sql
ALTER TABLE user RENAME users;
ALTER TABLE users CHANGE username uusername TINYTEXT NOT NULL;
ALTER TABLE users CHANGE password upassword TINYTEXT NOT NULL;
ALTER TABLE users CHANGE email uemail TINYTEXT;
ALTER TABLE users CHANGE ranking uranking INT NOT NULL;
ALTER TABLE users CHANGE email uemail TINYTEXT NOT NULL;
ALTER TABLE users CHANGE verified uverified INT NOT NULL;
UPDATE users SET uemail = NULL WHERE uemail = "";
```

## Cards

```sql
ALTER TABLE card RENAME cards;
ALTER TABLE cards CHANGE id cid INT NOT NULL;
ALTER TABLE cards CHANGE cardName cname TINYTEXT NOT NULL;
ALTER TABLE cards CHANGE typeID ctid INT NOT NULL;
ALTER TABLE cards CHANGE cardImage cimage TINYTEXT NOT NULL;
ALTER TABLE cards ADD FOREIGN KEY (ctid) REFERENCES cardtypes(ctid);
```

## CardFrames

```sql
ALTER TABLE frame RENAME cardframes;
ALTER TABLE cardframes CHANGE id cfid INT NOT NULL;
ALTER TABLE cardframes CHANGE name cfname TINYTEXT NOT NULL;
ALTER TABLE cardframes CHANGE path_front cfimagefront TINYTEXT NOT NULL;
ALTER TABLE cardframes CHANGE path_back cfimageback TINYTEXT NOT NULL;
```

## CardTypes

```sql
ALTER TABLE cardtype RENAME cardtypes;
ALTER TABLE cardtypes CHANGE name tname TINYTEXT NOT NULL;
ALTER TABLE cardtypes CHANGE id ctid INT NOT NULL;
```

## CardUnlocks

```sql
ALTER TABLE unlocked RENAME cardunlocks;
ALTER TABLE cardunlocks CHANGE userID uid INT NOT NULL;
ALTER TABLE cardunlocks CHANGE cardID cid INT NOT NULL;
ALTER TABLE cardunlocks CHANGE frameID cfid INT NOT NULL;
ALTER TABLE cardunlocks CHANGE cuid INT NOT NULL AUTO_INCREMENT;
ALTER TABLE cardunlocks CHANGE quality cuquality INT NOT NULL;
ALTER TABLE cardunlocks CHANGE level culevel INT NOT NULL;
ALTER TABLE cardunlocks ADD FOREIGN KEY (uid) REFERENCES users(uid);
ALTER TABLE cardunlocks ADD FOREIGN KEY (cid) REFERENCES cards(cid);
ALTER TABLE cardunlocks ADD FOREIGN KEY (cfid) REFERENCES cardframes(cfid);
```

## Friends

```sql
ALTER TABLE friend RENAME friends;
ALTER TABLE friends ADD COLUMN frid INTEGER PRIMARY KEY AUTO_INCREMENT FIRST;
ALTER TABLE friends CHANGE friend_status frstatus SMALLINT NOT NULL;
ALTER TABLE friends CHANGE userone uidone INT NOT NULL;
ALTER TABLE friends CHANGE usertwo uidtwo INT NOT NULL;
ALTER TABLE friends ADD FOREIGN KEY (uidone) REFERENCES users(uid)
ALTER TABLE friends ADD FOREIGN KEY (uidtwo) REFERENCES users(uid)
UPDATE friends SET friendStatus = 1 WHERE friendStatus = 2;
```

## TradeCards

```sql
ALTER TABLE trade RENAME tradecards;
ALTER TABLE tradecards CHANGE id tcid INT AUTO_INCREMENT PRIMARY KEY;
ALTER TABLE tradecards CHANGE userone uidone INT NOT NULL;
ALTER TABLE tradecards CHANGE usertwo uidtwo INT NOT NULL;
ALTER TABLE tradecards CHANGE cardId cuid INT NOT NULL;
ALTER TABLE tradecards ADD FOREIGN KEY (cuid) REFERENCES cardunlocks(cuid)
ALTER TABLE tradecards ADD FOREIGN KEY (uidone) REFERENCES users(cuid)
ALTER TABLE tradecards ADD FOREIGN KEY (uidtwo) REFERENCES users(cuid)
```

## Trades

```sql
ALTER TABLE trademanager RENAME trades;
ALTER TABLE trades ADD COLUMN tmid INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;
ALTER TABLE trades CHANGE userone uidone INT NOT NULL;
ALTER TABLE trades CHANGE usertwo uidtwo INT NOT NULL;
ALTER TABLE trades CHANGE statusone tstatusone INT NOT NULL;
ALTER TABLE trades CHANGE statustwo tstatustwo INT NOT NULL;
ALTER TABLE trades CHANGE cooldown tlasttrade DATETIME;
ALTER TABLE trades ADD FOREIGN KEY (uidone) REFERENCES users(uid);
ALTER TABLE trades ADD FOREIGN KEY (uidtwo) REFERENCES users(uid);
```

## Notifications

```sql
ALTER TABLE notification RENAME notifications;
ALTER TABLE notifications CHANGE userID uid INT NOT NULL;
ALTER TABLE notifications CHANGE title ntitle TINYTEXT NOT NULL;
ALTER TABLE notifications CHANGE message nmessage TEXT NOT NULL;
ALTER TABLE notifications CHANGE url nurl TEXT NOT NULL;
ALTER TABLE notifications CHANGE time ntime DATETIME NOT NULL;
ALTER TABLE notifications ADD FOREIGN KEY(uid) REFERENCES users(uid);
```

## Effects

```sql
ALTER TABLE effect RENAME cardeffects;
ALTER TABLE cardeffects CHANGE id ceid INT NOT NULL;
ALTER TABLE cardeffects CHANGE path ceimage TINYTEXT NOT NULL;
ALTER TABLE cardeffects CAHNGE opacity ceopacity FLOAT NOT NULL;
```

## PackData

```sql
ALTER TABLE packdata DROP PRIMARY KEY;
ALTER TABLE packdata ADD COLUMN pdid INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;
ALTER TABLE packdata CHANGE amount pdamount INT NOT NULL;
ALTER TABLE packdata CHANGE time pdtime DATETIME NOT NULL;
ALTER TABLE packdata ADD UNIQUE(pdtime);
```

## TradeSuggestions

```sql
ALTER TABLE tradesuggestion RENAME tradesuggestions;
ALTER TABLE tradesuggestions ADD COLUMN tsid INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;
ALTER TABLE tradesuggestions CHANGE userone uidone INT NOT NULL;
ALTER TABLE tradesuggestions CHANGE usertwo uidtwo INT NOT NULL;
ALTER TABLE tradesuggestions CHANGE card cuid INT NOT NULL;
ALTER TABLE tradesuggestions ADD FOREIGN KEY (uidone) REFERENCES users(uid);
ALTER TABLE tradesuggestions ADD FOREIGN KEY (uidtwo) REFERENCES users(uid);
ALTER TABLE tradesuggestions ADD FOREIGN KEY (cuid) REFERENCES cardunlocks(cuid);
```

## VerificationKeys

```sql
ALTER TABLE verificationkey RENAME verificationkeys;
ALTER TABLE verificationkeys CHANGE userID uid INT NOT NULL;
ALTER TABLE verificationkeys CHANGE key vkkey TEXT NOT NULL;
ALTER TABLE verificationkeys ADD FOREIGN KEY (uid) REFERENCES users(uid);
```

## PackTimes

```sql
ALTER TABLE packtime RENAME packtimes;
ALTER TABLE packtimes CHANGE time ptlastopened DATETIME;
ALTER TABLE packtimes CHANGE userID uid INT NOT NULL;
UPDATE packtimes SET ptlastopened = NULL WHERE ptlastopened = "0000-00-00 00:00:00";
```

## Achievements

```sql
ALTER TABLE badges RENAME achievements;
ALTER TABLE achievements CHANGE id aid INT NOT NULL;
ALTER TABLE achievements CHANGE image aimage TEXT NOT NULL;
ALTER TABLE achievements CHANGE text atext TEXT NOT NULL;
```

## AchievementUnlocks

```sql
ALTER TABLE unlockedBadges RENAME achievementunlocks;
ALTER TABLE achievementunlocks DROP PRIMARY KEY;
ALTER TABLE achievementunlocks ADD COLUMN auid INT NOT NULL PRIMARY KEY FIRST;
ALTER TABLE achievementunlocks CHANGE userId uid INT NOT NULL;
ALTER TABLE achievementunlocks CHANGE badgeId aid INT NOT NULL;
ALTER TABLE achievementunlocks ADD FOREIGN KEY (uid) REFERENCES users(uid),
ALTER TABLE achievementunlocks ADD FOREIGN KEY (aid) REFERENCES achievements(aid)
```
