package com.horror.h5.repository;

import com.horror.h5.entity.LastWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LastWordRepository extends JpaRepository<LastWord, Long> {
}
