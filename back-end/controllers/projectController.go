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

// @Summary Get all user projects
// @Description Retrieve all projects for the authenticated user
// @Tags projects
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.ApiResponse[[]models.Project]
// @Failure 500 {object} models.ApiErrorResponse
// @Router /projects/ [get]
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

// @Summary Create a new project
// @Description Create a new project for the authenticated user
// @Tags projects
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param project body models.ProjectCreate true "Project to create"
// @Success 200 {object} models.ApiResponse[[]models.Project]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /projects/ [post]
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

// @Summary Update a project
// @Description Update an existing project for the authenticated user
// @Tags projects
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param project body models.Project true "Project to update"
// @Success 200 {object} models.ApiResponse[[]models.Project]
// @Failure 400 {object} models.ApiErrorResponse
// @Failure 500 {object} models.ApiErrorResponse
// @Router /projects/ [put]
func (p *ProjectController) UpdateUserProject(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	var projectToUpdate models.Project
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

// @Summary Delete a project
// @Description Delete a project by ID for the authenticated user
// @Tags projects
// @Produce json
// @Security BearerAuth
// @Param id path int true "Project ID"
// @Success 200 {object} models.ApiResponse[[]models.Project]
// @Failure 500 {object} models.ApiErrorResponse
// @Router /projects/{id} [delete]
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
