package com.example.demo.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {
	
	@Autowired
	private UserRepository repository;
	
	public User saveUser(User user) {
		return repository.save(user);
	}
	
	public List<User> saveUsers(List<User> users) {
		return repository.saveAll(users);
	}
	
	public List<User> getUsers() {
		return repository.findAll();
	}
	
	public User getUserById(int id) {
		return repository.findById(id).orElse(null);
	}
	
	
	public String deleteById(int id) {
		repository.deleteById(id);
		return "user deleted " + id;
	}
	
	public User updateUser(User user) {
		User existing = repository.findById(user.getId()).orElse(null);
		existing.setName(user.getName());
		return repository.save(existing);
	}

}
