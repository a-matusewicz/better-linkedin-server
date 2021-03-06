-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema BetterLinkedIn_sp20
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema BetterLinkedIn_sp20
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `BetterLinkedIn_sp20` DEFAULT CHARACTER SET utf8 ;
USE `BetterLinkedIn_sp20` ;

-- -----------------------------------------------------
-- Table `BetterLinkedIn_sp20`.`Industries`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BetterLinkedIn_sp20`.`Industries` (
  `IndustryID` INT NOT NULL AUTO_INCREMENT,
  `IndustryName` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`IndustryID`),
  UNIQUE INDEX `IndustryID_UNIQUE` (`IndustryID` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `BetterLinkedIn_sp20`.`Companies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BetterLinkedIn_sp20`.`Companies` (
  `CompanyID` INT NOT NULL AUTO_INCREMENT,
  `CompanyName` VARCHAR(255) NOT NULL,
  `IndustryID` INT NULL,
  `CompanyDescription` VARCHAR(255) NULL,
  PRIMARY KEY (`CompanyID`),
  UNIQUE INDEX `CompanyID_UNIQUE` (`CompanyID` ASC) VISIBLE,
  INDEX `fk_Companies_Industries1_idx` (`IndustryID` ASC) VISIBLE,
  CONSTRAINT `fk_Companies_Industries1`
    FOREIGN KEY (`IndustryID`)
    REFERENCES `BetterLinkedIn_sp20`.`Industries` (`IndustryID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `BetterLinkedIn_sp20`.`People`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BetterLinkedIn_sp20`.`People` (
  `PersonID` INT NOT NULL AUTO_INCREMENT,
  `IndustryID` INT NULL,
  `PersonalDescription` VARCHAR(255) NULL,
  `FirstName` VARCHAR(255) NULL,
  `LastName` VARCHAR(255) NULL,
  `Email` VARCHAR(255) NOT NULL,
  `Password` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`PersonID`),
  UNIQUE INDEX `PersonID_UNIQUE` (`PersonID` ASC) VISIBLE,
  INDEX `fk_People_Industries1_idx` (`IndustryID` ASC) VISIBLE,
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE,
  CONSTRAINT `fk_People_Industries1`
    FOREIGN KEY (`IndustryID`)
    REFERENCES `BetterLinkedIn_sp20`.`Industries` (`IndustryID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `BetterLinkedIn_sp20`.`PlannedEvents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BetterLinkedIn_sp20`.`PlannedEvents` (
  `EventID` INT NOT NULL AUTO_INCREMENT,
  `EventName` VARCHAR(255) NOT NULL,
  `EventTime` DATETIME NULL,
  `EventDescription` VARCHAR(255) NULL,
  `IndustryID` INT NULL,
  `OrganizerID` INT NOT NULL,
  PRIMARY KEY (`EventID`),
  UNIQUE INDEX `EventID_UNIQUE` (`EventID` ASC) VISIBLE,
  INDEX `fk_Events_Industries1_idx` (`IndustryID` ASC) VISIBLE,
  INDEX `fk_PlannedEvents_People1_idx` (`OrganizerID` ASC) VISIBLE,
  CONSTRAINT `fk_Events_Industries1`
    FOREIGN KEY (`IndustryID`)
    REFERENCES `BetterLinkedIn_sp20`.`Industries` (`IndustryID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_PlannedEvents_People1`
    FOREIGN KEY (`OrganizerID`)
    REFERENCES `BetterLinkedIn_sp20`.`People` (`PersonID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `BetterLinkedIn_sp20`.`InterestGroups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BetterLinkedIn_sp20`.`InterestGroups` (
  `GroupID` INT NOT NULL AUTO_INCREMENT,
  `GroupName` VARCHAR(255) NOT NULL,
  `GroupDescription` VARCHAR(255) NULL,
  `IndustryID` INT NULL,
  `OrganizerID` INT NOT NULL,
  PRIMARY KEY (`GroupID`),
  UNIQUE INDEX `GroupID_UNIQUE` (`GroupID` ASC) VISIBLE,
  INDEX `fk_Groups_Industries1_idx` (`IndustryID` ASC) VISIBLE,
  INDEX `fk_InterestGroups_People1_idx` (`OrganizerID` ASC) VISIBLE,
  CONSTRAINT `fk_Groups_Industries1`
    FOREIGN KEY (`IndustryID`)
    REFERENCES `BetterLinkedIn_sp20`.`Industries` (`IndustryID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_InterestGroups_People1`
    FOREIGN KEY (`OrganizerID`)
    REFERENCES `BetterLinkedIn_sp20`.`People` (`PersonID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `BetterLinkedIn_sp20`.`Employed`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BetterLinkedIn_sp20`.`Employed` (
  `CompanyID` INT NOT NULL,
  `PersonID` INT NOT NULL,
  `CompanyPosition` VARCHAR(255) NOT NULL,
  `StartDate` DATETIME NULL,
  `EndDate` DATETIME NULL,
  `EmploymentDescription` VARCHAR(255) NULL,
  PRIMARY KEY (`CompanyID`, `PersonID`),
  INDEX `fk_Employed_People1_idx` (`PersonID` ASC) VISIBLE,
  CONSTRAINT `fk_Employed_Companies`
    FOREIGN KEY (`CompanyID`)
    REFERENCES `BetterLinkedIn_sp20`.`Companies` (`CompanyID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Employed_People1`
    FOREIGN KEY (`PersonID`)
    REFERENCES `BetterLinkedIn_sp20`.`People` (`PersonID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `BetterLinkedIn_sp20`.`Attending`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BetterLinkedIn_sp20`.`Attending` (
  `PersonID` INT NOT NULL,
  `EventID` INT NOT NULL,
  `IsOrganizer` TINYINT NOT NULL,
  `RSVPDate` DATETIME NULL,
  PRIMARY KEY (`PersonID`, `EventID`),
  INDEX `fk_Attending_Events1_idx` (`EventID` ASC) VISIBLE,
  CONSTRAINT `fk_Attending_People1`
    FOREIGN KEY (`PersonID`)
    REFERENCES `BetterLinkedIn_sp20`.`People` (`PersonID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Attending_Events1`
    FOREIGN KEY (`EventID`)
    REFERENCES `BetterLinkedIn_sp20`.`PlannedEvents` (`EventID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `BetterLinkedIn_sp20`.`MemberOf`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BetterLinkedIn_sp20`.`MemberOf` (
  `PersonID` INT NOT NULL,
  `GroupID` INT NOT NULL,
  `IsOrganizer` TINYINT NOT NULL,
  `JoinDate` DATETIME NULL,
  PRIMARY KEY (`PersonID`, `GroupID`),
  INDEX `fk_MemberOf_Groups1_idx` (`GroupID` ASC) VISIBLE,
  CONSTRAINT `fk_MemberOf_People1`
    FOREIGN KEY (`PersonID`)
    REFERENCES `BetterLinkedIn_sp20`.`People` (`PersonID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_MemberOf_Groups1`
    FOREIGN KEY (`GroupID`)
    REFERENCES `BetterLinkedIn_sp20`.`InterestGroups` (`GroupID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
