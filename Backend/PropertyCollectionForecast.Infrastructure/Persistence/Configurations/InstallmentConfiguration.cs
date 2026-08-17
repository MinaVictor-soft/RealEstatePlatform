namespace PropertyCollectionForecast.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PropertyCollectionForecast.Domain.Entities;

public sealed class InstallmentConfiguration : IEntityTypeConfiguration<Installment>
{
    public void Configure(EntityTypeBuilder<Installment> builder)
    {
        builder.ToTable("Installments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.DueDate).HasColumnType("date");
        builder.Property(x => x.ExpectedAmount).HasPrecision(18, 2);
        builder.Property(x => x.PaidAmount).HasPrecision(18, 2);
        builder.Property(x => x.RemainingAmount).HasPrecision(18, 2);

        builder.HasOne(x => x.Contract)
            .WithMany(x => x.Installments)
            .HasForeignKey(x => x.ContractId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.ContractId, x.SequenceNumber }).IsUnique();
    }
}
