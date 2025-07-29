import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AssessmentQuiz } from './assessment-quiz';
import { ChecklistService } from '../../services/checklist.service';
import { OrganizationService } from '../../services/organization.service';
import { IdGeneratorService } from '../../services/id-generator.service';
import { ScoringService } from '../../services/scoring.service';
import {
  Checklist,
  Section,
  QuestionType,
  StandardQuestion,
} from '../../interfaces/chkLst.interface';

describe('AssessmentQuiz', () => {
  let component: AssessmentQuiz;
  let fixture: ComponentFixture<AssessmentQuiz>;
  let mockChecklistService: jasmine.SpyObj<ChecklistService>;
  let mockOrganizationService: jasmine.SpyObj<OrganizationService>;
  let mockIdGeneratorService: jasmine.SpyObj<IdGeneratorService>;
  let mockScoringService: jasmine.SpyObj<ScoringService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockChecklist: Checklist = {
    id: 'test-checklist-1',
    healthProgram: 'Primary Care',
    organizationalLevel: 'Regional',
    department: 'Emergency',
    sections: [
      {
        id: 'section-1',
        title: 'Safety Standards',
        score: 0,
        maxScore: 20,
        questions: [
          {
            id: 'question-1',
            type: QuestionType.STANDARD,
            title: 'Are safety protocols documented?',
            score: 0,
            maxScore: 10,
          } as StandardQuestion,
          {
            id: 'question-2',
            type: QuestionType.STANDARD,
            title: 'Are protocols up to date?',
            score: 0,
            maxScore: 10,
          } as StandardQuestion,
        ],
      } as Section,
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    version: '1.0.0',
  };

  beforeEach(async () => {
    mockChecklistService = jasmine.createSpyObj('ChecklistService', [
      'loadChecklists',
      'saveChecklist',
      'checklists',
      'loading',
      'error',
    ]);

    mockOrganizationService = jasmine.createSpyObj('OrganizationService', [
      'healthProgramNames',
      'organizationalLevelNames',
      'departmentNames',
    ]);

    mockIdGeneratorService = jasmine.createSpyObj('IdGeneratorService', [
      'generateAssessmentId',
      'generateUuid',
      'generateSectionId',
      'generateQuestionId',
    ]);

    mockScoringService = jasmine.createSpyObj('ScoringService', [
      'calculateChecklistMaxScore',
      'calculateSectionMaxScore',
      'calculateQuestionMaxScore',
      'calculateChecklistScores',
      'config',
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    // Setup default return values
    mockChecklistService.checklists.and.returnValue([mockChecklist]);
    mockChecklistService.loading.and.returnValue(false);
    mockChecklistService.error.and.returnValue(null);
    mockChecklistService.loadChecklists.and.returnValue(Promise.resolve());
    mockChecklistService.saveChecklist.and.returnValue(Promise.resolve('test-id'));

    mockOrganizationService.healthProgramNames.and.returnValue([
      'Primary Care',
      'Specialized Care',
    ]);
    mockOrganizationService.organizationalLevelNames.and.returnValue([
      'Local',
      'Regional',
    ]);
    mockOrganizationService.departmentNames.and.returnValue([
      'Emergency',
      'Surgery',
    ]);

    mockIdGeneratorService.generateAssessmentId.and.returnValue('assessment-123');
    mockIdGeneratorService.generateUuid.and.returnValue('uuid-123');
    mockIdGeneratorService.generateSectionId.and.returnValue('section-123');
    mockIdGeneratorService.generateQuestionId.and.returnValue('question-123');

    mockScoringService.calculateChecklistMaxScore.and.returnValue(100);
    mockScoringService.calculateSectionMaxScore.and.returnValue(20);
    mockScoringService.calculateQuestionMaxScore.and.returnValue(10);
    mockScoringService.config.and.returnValue({
      defaultMaxScore: 10,
      weights: {
        standardQuestion: 1.0,
        dataControlQuestion: 1.2,
        subQuestionMultiplier: 0.8,
      },
      enableWeighting: false,
      roundScores: true,
      decimalPlaces: 2,
    });

    await TestBed.configureTestingModule({
      imports: [AssessmentQuiz, ReactiveFormsModule],
      providers: [
        { provide: ChecklistService, useValue: mockChecklistService },
        { provide: OrganizationService, useValue: mockOrganizationService },
        { provide: IdGeneratorService, useValue: mockIdGeneratorService },
        { provide: ScoringService, useValue: mockScoringService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentQuiz);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize forms on init', () => {
    component.ngOnInit();
    expect(component.assessmentForm).toBeDefined();
    expect(component.responseForm).toBeDefined();
  });

  it('should start new assessment when no checklist ID provided', async () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    await component.ngOnInit();

    expect(component.currentChecklist()).toBeDefined();
    expect(component.assessmentSession()).toBeDefined();
  });

  it('should load existing checklist when ID provided', async () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('test-checklist-1');

    await component.ngOnInit();

    expect(mockChecklistService.loadChecklists).toHaveBeenCalled();
    expect(component.currentChecklist()).toEqual(mockChecklist);
  });

  it('should calculate progress percentage correctly', () => {
    component.ngOnInit();

    // Mock assessment session with some responses
    const mockSession = {
      id: 'session-1',
      checklistId: 'test-checklist-1',
      startTime: new Date(),
      responses: [
        {
          questionId: 'question-1',
          score: 8,
          notes: 'Test note',
          timestamp: new Date(),
        },
      ],
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      isCompleted: false,
      totalScore: 8,
      maxPossibleScore: 100,
    };

    component['_assessmentSession'].set(mockSession);
    component['_currentChecklist'].set(mockChecklist);

    const progress = component.progressPercentage();
    expect(progress).toBe(50); // 1 out of 2 questions answered
  });

  it('should navigate to next question correctly', () => {
    component.ngOnInit();
    component['_currentChecklist'].set(mockChecklist);
    component['_currentSectionIndex'].set(0);
    component['_currentQuestionIndex'].set(0);

    component.nextQuestion();

    expect(component.currentQuestionIndex()).toBe(1);
  });

  it('should navigate to previous question correctly', () => {
    component.ngOnInit();
    component['_currentChecklist'].set(mockChecklist);
    component['_currentSectionIndex'].set(0);
    component['_currentQuestionIndex'].set(1);

    component.previousQuestion();

    expect(component.currentQuestionIndex()).toBe(0);
  });

  it('should determine if it can navigate next', () => {
    component.ngOnInit();
    component['_currentChecklist'].set(mockChecklist);
    component['_currentSectionIndex'].set(0);
    component['_currentQuestionIndex'].set(0);

    expect(component.canNavigateNext()).toBe(true);

    component['_currentQuestionIndex'].set(1);
    expect(component.canNavigateNext()).toBe(false);
  });

  it('should determine if it can navigate previous', () => {
    component.ngOnInit();
    component['_currentSectionIndex'].set(0);
    component['_currentQuestionIndex'].set(0);

    expect(component.canNavigatePrevious()).toBe(false);

    component['_currentQuestionIndex'].set(1);
    expect(component.canNavigatePrevious()).toBe(true);
  });

  it('should identify last question correctly', () => {
    component.ngOnInit();
    component['_currentChecklist'].set(mockChecklist);
    component['_currentSectionIndex'].set(0);
    component['_currentQuestionIndex'].set(0);

    expect(component.isLastQuestion()).toBe(false);

    component['_currentQuestionIndex'].set(1);
    expect(component.isLastQuestion()).toBe(true);
  });

  it('should save and exit', async () => {
    component.ngOnInit();

    await component.saveAndExit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/checklists']);
  });

  it('should get max score for current question', () => {
    component.ngOnInit();
    component['_currentChecklist'].set(mockChecklist);
    component['_currentSectionIndex'].set(0);
    component['_currentQuestionIndex'].set(0);

    const maxScore = component.getMaxScoreForCurrentQuestion();
    expect(maxScore).toBe(10);
  });

  it('should get question type label', () => {
    expect(component.getQuestionTypeLabel(QuestionType.STANDARD)).toBe('Standard Question');
    expect(component.getQuestionTypeLabel(QuestionType.DATA_CONTROL)).toBe('Data Control');
  });

  it('should check if question is answered', () => {
    component.ngOnInit();

    const mockSession = {
      id: 'session-1',
      checklistId: 'test-checklist-1',
      startTime: new Date(),
      responses: [
        {
          questionId: 'question-1',
          score: 8,
          notes: 'Test note',
          timestamp: new Date(),
        },
      ],
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      isCompleted: false,
      totalScore: 8,
      maxPossibleScore: 100,
    };

    component['_assessmentSession'].set(mockSession);

    expect(component.isQuestionAnswered('question-1')).toBe(true);
    expect(component.isQuestionAnswered('question-2')).toBe(false);
  });

  it('should handle start over confirmation', async () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.ngOnInit();
    component['_currentChecklist'].set(mockChecklist);

    await component.startOver();

    expect(component.currentSectionIndex()).toBe(0);
    expect(component.currentQuestionIndex()).toBe(0);
    expect(component.showResults()).toBe(false);
  });

  it('should not start over if user cancels', async () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.ngOnInit();
    component['_currentSectionIndex'].set(1);

    await component.startOver();

    expect(component.currentSectionIndex()).toBe(1);
  });

  it('should complete assessment successfully', async () => {
    component.ngOnInit();
    component['_currentChecklist'].set(mockChecklist);

    const mockSession = {
      id: 'session-1',
      checklistId: 'test-checklist-1',
      startTime: new Date(),
      responses: [
        {
          questionId: 'question-1',
          score: 8,
          notes: 'Test note',
          timestamp: new Date(),
        },
      ],
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      isCompleted: false,
      totalScore: 8,
      maxPossibleScore: 100,
    };

    component['_assessmentSession'].set(mockSession);

    await component.completeAssessment();

    expect(component.showResults()).toBe(true);
    expect(component.assessmentSession()?.isCompleted).toBe(true);
  });

  it('should export results', () => {
    component.ngOnInit();

    const mockResults = {
      overall: { totalScore: 80, maxScore: 100, percentage: 80 },
      sections: [],
    };

    spyOn(component, 'assessmentResults').and.returnValue(mockResults);

    const mockSession = {
      id: 'session-1',
      checklistId: 'test-checklist-1',
      startTime: new Date(),
      responses: [],
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      isCompleted: true,
      totalScore: 80,
      maxPossibleScore: 100,
    };

    component['_assessmentSession'].set(mockSession);

    // Mock DOM methods
    const mockBlob = new Blob(['test'], { type: 'application/json' });
    spyOn(window, 'Blob').and.returnValue(mockBlob);

    const mockURL = {
      createObjectURL: jasmine.createSpy('createObjectURL').and.returnValue('mock-url'),
      revokeObjectURL: jasmine.createSpy('revokeObjectURL'),
    };
    spyOn(window.URL, 'createObjectURL').and.returnValue('mock-url');
    spyOn(window.URL, 'revokeObjectURL');

    const mockElement = {
      href: '',
      download: '',
      click: jasmine.createSpy('click'),
    };
    spyOn(document, 'createElement').and.returnValue(mockElement as any);
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');

    component.exportResults();

    expect(mockElement.download).toContain('assessment-results-');
    expect(mockElement.click).toHaveBeenCalled();
  });

  it('should handle errors during assessment loading', async () => {
    mockChecklistService.loadChecklists.and.returnValue(
      Promise.reject(new Error('Failed to load'))
    );
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('test-checklist-1');

    await component.ngOnInit();

    expect(component.error()).toBe('Failed to load');
  });

  it('should jump to specific question', () => {
    component.ngOnInit();
    component['_currentChecklist'].set(mockChecklist);

    component.jumpToQuestion(0, 1);

    expect(component.currentSectionIndex()).toBe(0);
    expect(component.currentQuestionIndex()).toBe(1);
  });
});
