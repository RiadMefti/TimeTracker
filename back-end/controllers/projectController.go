package controllers

import (
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/RiadMefti/TimeTracker/back-end/utils"
	"github.com/gofiber/fiber/v2"
)

type ProjectController struct {
	projectService *services.ProjectService
}

func NewProjectController(projectService *services.ProjectService) *ProjectController {
	return &ProjectController{
		projectService: projectService,
	}
}

func (p *ProjectController) GetUserProjects(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	projects, err := p.projectService.GetUserProjects(userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "an error occured while retrieving projects"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, projects, "projects retrieved successfully"))
}

func (p *ProjectController) CreateUserProject(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	var projectToCreate models.ProjectCreate
	err := c.BodyParser(&projectToCreate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid request body"))
	}

	projects, err := p.projectService.CreateUserProject(projectToCreate, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "An error occurred while creating project"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, projects, "Project created successfully"))
}
func (p *ProjectController) UpdateUserProject(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	var projectToUpdate models.ProjectDto
	err := c.BodyParser(&projectToUpdate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid request body"))
	}
	projects, err := p.projectService.UpdateUserProject(projectToUpdate, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "an error occured while updating project"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, projects, "project updated successfully"))

}
func (p *ProjectController) DeleteUserProject(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}
	projectID := c.Params("id")
	projects, err := p.projectService.DeleteUserProject(projectID, userAuth.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(utils.CreateApiResponse[interface{}](false, nil, "an error occured while deleting project"))
	}

	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, projects, "project deleted successfully"))
}
