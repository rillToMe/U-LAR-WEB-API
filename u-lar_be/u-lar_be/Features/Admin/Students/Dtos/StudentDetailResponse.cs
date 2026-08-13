namespace u_lar_be.Features.Admin.Students.DTOs;

public class StudentDetailResponse
{
    public int Id { get; set; }
    public string Nim { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    
    public int ProgressPercentage { get; set; }
    public int TotalMissionCompleted { get; set; }
    public double? AverageScore { get; set; }
}