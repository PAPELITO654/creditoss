-- Adminer 5.3.0 MySQL 8.0.41 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `idCliente` bigint NOT NULL AUTO_INCREMENT,
  `nombreCliente` varchar(100) NOT NULL,
  `numero` int NOT NULL,
  PRIMARY KEY (`idCliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `clientes` (`idCliente`, `nombreCliente`, `numero`) VALUES
(1,	'Jose',	500),
(2,	'Juan',	501);

DROP TABLE IF EXISTS `cuentas`;
CREATE TABLE `cuentas` (
  `idCuenta` bigint NOT NULL AUTO_INCREMENT,
  `idCliente` bigint NOT NULL,
  `monto` double NOT NULL,
  `fechaHora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCuenta`),
  KEY `idCliente` (`idCliente`),
  CONSTRAINT `cuentas_ibfk_1` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`idCliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `cuentas` (`idCuenta`, `idCliente`, `monto`, `fechaHora`) VALUES
(1,	1,	40,	'2025-02-05 20:00:00'),
(2,	1,	40,	'2025-02-06 20:00:00'),
(3,	2,	60,	'2025-02-06 16:00:00');

-- 2025-09-01 02:13:54 UTC
