package com.example.repository;

import com.example.model.LearningRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningRecordRepository extends JpaRepository<LearningRecord, Long> {
    List<LearningRecord> findByUserId(Long userId);
}