package services

import "github.com/RiadMefti/TimeTracker/back-end/repositories"

type UserService struct {
	userRepository *repositories.UserRepository
}

func NewUserService(userRepository *repositories.UserRepository) *UserService {
	return &UserService{
		userRepository: userRepository,
	}
}

func (u *UserService) CreateUser(email string) error {
	return u.userRepository.CreateUser(email)
}
