-- SIRINE: skema MySQL (MVP)
-- Referensi cepat. Di Laravel tetap ditulis sebagai migration oleh Dev B.

CREATE TABLE admins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

CREATE TABLE reporters (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  whatsapp_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

CREATE TABLE reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_code VARCHAR(30) NOT NULL UNIQUE,
  reporter_id BIGINT UNSIGNED NOT NULL,
  input_type ENUM('text','voice') NOT NULL DEFAULT 'text',
  original_text TEXT NULL,
  incident_type VARCHAR(100) NULL,
  incident_time DATETIME NULL,
  description TEXT NULL,
  victim_count INT NULL,
  victim_condition TEXT NULL,
  location_description TEXT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  location_source VARCHAR(30) NULL,
  location_confirmed VARCHAR(30) NOT NULL DEFAULT 'unconfirmed',
  summary TEXT NULL,
  completeness_status VARCHAR(20) NOT NULL DEFAULT 'incomplete',
  verification_status VARCHAR(30) NOT NULL DEFAULT 'belum_terkonfirmasi',
  report_status VARCHAR(30) NOT NULL DEFAULT 'baru_diterima',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES reporters(id),
  INDEX idx_reports_status (report_status),
  INDEX idx_reports_created (created_at)
);

CREATE TABLE conversations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT UNSIGNED NOT NULL,
  report_id BIGINT UNSIGNED NULL,
  conversation_status VARCHAR(20) NOT NULL DEFAULT 'active',
  current_question VARCHAR(100) NULL,
  followup_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_conv_reporter FOREIGN KEY (reporter_id) REFERENCES reporters(id),
  CONSTRAINT fk_conv_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL
);

CREATE TABLE messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  report_id BIGINT UNSIGNED NULL,
  wa_message_id VARCHAR(100) NOT NULL UNIQUE,
  direction ENUM('inbound','outbound') NOT NULL,
  message_type ENUM('text','audio','location','other') NOT NULL DEFAULT 'text',
  body TEXT NULL,
  audio_path VARCHAR(255) NULL,
  transcript TEXT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  process_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NULL,
  CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  CONSTRAINT fk_msg_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL,
  INDEX idx_msg_conv_time (conversation_id, created_at)
);

CREATE TABLE report_details (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id BIGINT UNSIGNED NOT NULL,
  field_name VARCHAR(50) NOT NULL,
  field_value TEXT NULL,
  information_status VARCHAR(20) NOT NULL DEFAULT 'unknown',
  source_message_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_det_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_det_msg FOREIGN KEY (source_message_id) REFERENCES messages(id) ON DELETE SET NULL,
  UNIQUE KEY uq_report_field (report_id, field_name)
);

CREATE TABLE report_histories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  previous_status VARCHAR(30) NULL,
  new_status VARCHAR(30) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NULL,
  CONSTRAINT fk_hist_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_hist_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);
