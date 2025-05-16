package services

import (
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/repositories"
)

type AuthService struct {
	userRepository *repositories.UserRepository
}

func NewAuthService(userRepository *repositories.UserRepository) *AuthService {
	return &AuthService{
		userRepository: userRepository,
	}
}
func (u *AuthService) RegisterUser(user models.User) (bool, error) {
	// Check if the user already exists
	exists, err := u.userRepository.GetUserBy(user.ID)
	if err != nil {
		return false, err
	}
	if exists {
		// User exists, so no creation happened.
		return false, nil
	}

	// Create the user since it does not exist.
	err = u.userRepository.CreateUser(user)
	if err != nil {
		return false, err
	}
	return true, nil
}
