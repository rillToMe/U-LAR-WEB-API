using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace u_lar_be.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "role",
                table: "admins",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "ADMIN");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "role",
                table: "admins");
        }
    }
}
