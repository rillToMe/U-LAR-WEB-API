using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace u_lar_be.Migrations
{
    /// <inheritdoc />
    public partial class AddEssayScore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "score",
                table: "exam_answers",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "score",
                table: "exam_answers");
        }
    }
}
