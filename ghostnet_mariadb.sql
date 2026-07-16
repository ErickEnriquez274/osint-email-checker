SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema ghostnet
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ghostnet` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ghostnet`;

-- -----------------------------------------------------
-- Tabla `ghostnet`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ghostnet`.`usuarios` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `nombre_usuario` VARCHAR(100) NOT NULL,
  `correo`         VARCHAR(255) NOT NULL,
  `contrasena`     VARCHAR(255) NOT NULL,
  `creado_en`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `nombre_usuario_UNIQUE` (`nombre_usuario`),
  UNIQUE INDEX `correo_UNIQUE`         (`correo`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla `ghostnet`.`recuperacion_contrasena`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ghostnet`.`recuperacion_contrasena` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `usuario_id` INT          NOT NULL,
  `token`      VARCHAR(255) NOT NULL,
  `expira_en`  DATETIME     NOT NULL,
  `creado_en`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `token_UNIQUE`               (`token`),
  INDEX        `fk_recuperacion_usuario_idx` (`usuario_id`),
  CONSTRAINT `fk_recuperacion_usuario`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `ghostnet`.`usuarios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla `ghostnet`.`busquedas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ghostnet`.`busquedas` (
  `id`              INT                   NOT NULL AUTO_INCREMENT,
  `usuario_id`      INT                   NOT NULL,
  `tipo`            ENUM('email','phone') NOT NULL,
  `consulta`        VARCHAR(255)          NOT NULL,
  `cache_resultado` JSON                  NULL DEFAULT NULL,
  `creado_en`       DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_busqueda_usuario_idx` (`usuario_id`),
  CONSTRAINT `fk_busqueda_usuario`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `ghostnet`.`usuarios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla `ghostnet`.`sitios_detectados`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ghostnet`.`sitios_detectados` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `busqueda_id`  INT          NOT NULL,
  `nombre_sitio` VARCHAR(255) NOT NULL,
  `dominio`      VARCHAR(255) NOT NULL,
  `detectado_en` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_sitio_busqueda_idx` (`busqueda_id`),
  CONSTRAINT `fk_sitio_busqueda`
    FOREIGN KEY (`busqueda_id`)
    REFERENCES `ghostnet`.`busquedas` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla `ghostnet`.`detalles_filtracion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ghostnet`.`detalles_filtracion` (
  `id`                INT          NOT NULL AUTO_INCREMENT,
  `busqueda_id`       INT          NOT NULL,
  `nombre_filtracion` VARCHAR(255) NOT NULL,
  `tipos_datos`       TEXT         NULL DEFAULT NULL,
  `fecha_filtracion`  DATE         NULL DEFAULT NULL,
  `creado_en`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_filtracion_busqueda_idx` (`busqueda_id`),
  CONSTRAINT `fk_filtracion_busqueda`
    FOREIGN KEY (`busqueda_id`)
    REFERENCES `ghostnet`.`busquedas` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla `ghostnet`.`puntuacion_riesgo`
-- Relacion 1 a 1 con busquedas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ghostnet`.`puntuacion_riesgo` (
  `id`          INT                                    NOT NULL AUTO_INCREMENT,
  `busqueda_id` INT                                    NOT NULL,
  `puntuacion`  INT                                    NOT NULL,
  `nivel`       ENUM('low','medium','high','critical') NOT NULL,
  `creado_en`   DATETIME                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `busqueda_id_UNIQUE`  (`busqueda_id`),
  INDEX         `fk_riesgo_busqueda_idx` (`busqueda_id`),
  CONSTRAINT `fk_riesgo_busqueda`
    FOREIGN KEY (`busqueda_id`)
    REFERENCES `ghostnet`.`busquedas` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
