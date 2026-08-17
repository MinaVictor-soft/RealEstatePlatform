namespace PropertyCollectionForecast.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PropertyCollectionForecast.Domain.Entities;

public sealed class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("Units");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ProjectName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Area).HasPrecision(18, 2);
        builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(50);
        builder.HasIndex(x => x.Code).IsUnique();
    }
}
