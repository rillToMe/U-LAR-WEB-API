using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace u_lar_be.Migrations
{
    /// <inheritdoc />
    public partial class AddExamAnswerFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_flagged",
                table: "exam_answers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_flagged",
                table: "exam_answers");
        }
    }
}
