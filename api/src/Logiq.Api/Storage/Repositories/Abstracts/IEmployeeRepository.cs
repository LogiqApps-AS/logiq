using Logiq.Api.Contracts;

namespace Logiq.Api.Storage.Repositories.Abstracts;

public interface IEmployeeRepository
{
    Task<IReadOnlyList<Employee>> ListByTeamAsync(string teamId, CancellationToken cancellationToken = default);
    Task<Employee?> GetByIdAsync(string teamId, string employeeId, CancellationToken cancellationToken = default);
    Task UpsertAsync(string teamId, Employee employee, CancellationToken cancellationToken = default);
}