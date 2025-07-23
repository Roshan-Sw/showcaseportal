import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './employees/employees.module';
import { EmployeeDocumentsModule } from './employee-documents/employee-documents.module';
import { EmployeeSkillHobbyModule } from './employee-skill-hobby/employee-skill-hobby.module';
import { EmployeeEmergencyContactModule } from './employee-emergency-contact/employee-emergency-contact.module';
import { EmployeePhotosModule } from './employee-photos/employee-photos.module';
import { EmployeeNoteModule } from './employee-note/employee-note.module';
import { DepartmentModule } from './department/department.module';
import { RoleModule } from './role/role.module';
import { EmployeeLevelModule } from './employee-level/employee-level.module';
import { DocumentCategoryModule } from './document-category/document-category.module';
import { DocumentsModule } from './documents/documents.module';
import { EmployeeRatingParameterModule } from './employee-rating-parameter/employee-rating-parameter.module';
import { PeerFeedbackModule } from './peer-feedback/peer-feedback.module';
import { AwardProgramsModule } from './award-programs/award-programs.module';
import { AwardWinnerModule } from './award-winner/award-winner.module';
import { EmployeeSalaryRevisionModule } from './employee-salary-revision/employee-salary-revision.module';
import { EmployeeEvaluationTemplateModule } from './employee-evaluation-template/employee-evaluation-template.module';
import { EmployeeEvaluationsModule } from './employee-evaluations/employee-evaluations.module';
import { EmployeeEvaluationResponsesModule } from './employee-evaluation-responses/employee-evaluation-responses.module';
import { PerformanceGoalModule } from './performance-goal/performance-goal.module';
import { StarRatingModule } from './star-rating/star-rating.module';
import { ComplianceModule } from './compliance/compliance.module';
import { BoardMeetingModule } from './board-meeting/board-meeting.module';
import { LeaveApplicationModule } from './leave-application/leave-application.module';
import { LeaveLedgerModule } from './leave-ledger/leave-ledger.module';
import { CompanyCalendarModule } from './company-calendar/company-calendar.module';
import { UsersModule } from './users/users.module';
import { RecruitmentRequestsModule } from './recruitment-requests/recruitment-requests.module';

@Module({
  imports: [
    PrismaModule,
    EmployeesModule,
    EmployeeDocumentsModule,
    EmployeeSkillHobbyModule,
    EmployeeEmergencyContactModule,
    EmployeePhotosModule,
    EmployeeNoteModule,
    DepartmentModule,
    RoleModule,
    EmployeeLevelModule,
    DocumentCategoryModule,
    DocumentsModule,
    EmployeeRatingParameterModule,
    PeerFeedbackModule,
    AwardProgramsModule,
    AwardWinnerModule,
    EmployeeSalaryRevisionModule,
    EmployeeEvaluationTemplateModule,
    EmployeeEvaluationsModule,
    EmployeeEvaluationResponsesModule,
    PerformanceGoalModule,
    StarRatingModule,
    ComplianceModule,
    BoardMeetingModule,
    LeaveApplicationModule,
    LeaveLedgerModule,
    CompanyCalendarModule,
    UsersModule,
    RecruitmentRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
