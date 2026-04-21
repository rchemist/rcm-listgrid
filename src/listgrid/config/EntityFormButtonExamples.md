# EntityFormButton 모달 시스템 사용 예제

## 🎯 기본 모달 사용법

```typescript
// 1. 기본 모달 생성
const customButton = new EntityFormButton("showInfoModal")
  .withLabel("정보 보기")
  .withClassName("btn btn-info")
  .withOnClick(async (props) => {
    const modalId = props.showModal?.({
      title: "사용자 정보",
      size: "md",
      content: (
        <div className="p-4">
          <p>사용자 ID: {props.entityForm.id}</p>
          <p>생성일: {new Date().toLocaleDateString()}</p>
        </div>
      ),
      onClose: async () => {
        console.log("모달이 닫혔습니다.");
      }
    });
    
    return props.entityForm;
  });
```

## 🔄 모달 간 데이터 전달

```typescript
// 2. 첫 번째 모달에서 두 번째 모달로 데이터 전달
const showWizardButton = new EntityFormButton("showWizard")
  .withLabel("설정 마법사")
  .withOnClick(async (props) => {
    const modalId = props.showModal?.({
      title: "설정 마법사 - 1단계",
      size: "lg",
      content: (
        <WizardStep1Component 
          onNext={(data) => {
            // 현재 모달 닫고 다음 단계 모달 열기
            props.closeModal?.(modalId!);
            
            const nextModalId = props.showModal?.({
              title: "설정 마법사 - 2단계",
              content: <WizardStep2Component previousData={data} />,
              data: { step: 2, ...data }
            });
          }}
        />
      ),
      data: { step: 1 }
    });
    
    return props.entityForm;
  });
```

## 🎨 조건부 모달 표시

```typescript
// 3. step 정보를 활용한 조건부 모달
const conditionalButton = new EntityFormButton("conditionalModal")
  .withLabel("조건부 확인")
  .withHidden(async (props) => {
    // createStep이 아니거나 마지막 단계가 아니면 숨김
    return !props.step?.useCreateStep || 
           props.step.currentStep !== props.step.maxStep;
  })
  .withOnClick(async (props) => {
    const isComplete = props.step?.createStepFields.every(field => 
      props.entityForm.getValue(field) !== null
    );
    
    props.showModal?.({
      title: isComplete ? "완료 확인" : "누락 확인",
      content: (
        <div className="p-4">
          {isComplete ? (
            <p className="text-green-600">모든 필수 항목이 완료되었습니다!</p>
          ) : (
            <p className="text-red-600">일부 필수 항목이 누락되었습니다.</p>
          )}
        </div>
      ),
      size: "sm"
    });
    
    return props.entityForm;
  });
```

## 🔧 복잡한 모달 워크플로우

```typescript
// 4. 승인 워크플로우가 있는 모달
const approvalButton = new EntityFormButton("approvalWorkflow")
  .withLabel("승인 요청")
  .withOnClick(async (props) => {
    const modalId = props.showModal?.({
      title: "승인 요청",
      size: "lg",
      content: (
        <ApprovalFormComponent
          entityForm={props.entityForm}
          onSubmit={async (approvalData) => {
            // 승인 요청 처리
            try {
              await submitApprovalRequest(approvalData);
              
              // 현재 모달 닫기
              await props.closeModal?.(modalId!);
              
              // 성공 모달 표시
              props.showModal?.({
                title: "승인 요청 완료",
                content: <SuccessMessage />,
                size: "sm",
                onAfterClose: async () => {
                  // 페이지 새로고침 또는 리다이렉트
                  window.location.reload();
                }
              });
              
            } catch (error) {
              // 에러 모달 표시 (현재 모달은 유지)
              props.showModal?.({
                title: "오류 발생",
                content: <ErrorMessage error={error} />,
                size: "sm"
              });
            }
          }}
        />
      ),
      closeOnClickOutside: false, // 실수로 닫히지 않도록
    });
    
    return props.entityForm;
  });
```

## 🎛️ 모달 상태 관리

```typescript
// 5. 모달 간 상태 공유 및 업데이트
const sharedStateButton = new EntityFormButton("sharedState")
  .withLabel("공유 상태 모달")
  .withOnClick(async (props) => {
    const modalId = props.showModal?.({
      title: "공유 상태 관리",
      content: (
        <SharedStateComponent
          onUpdateData={(newData) => {
            // 모달 데이터 업데이트
            props.updateModalData?.(modalId!, newData);
          }}
          onOpenChildModal={() => {
            // 자식 모달 열기
            const childModalId = props.showModal?.({
              title: "자식 모달",
              content: (
                <ChildModalComponent
                  parentData={props.getModalData?.(modalId!)}
                  onSave={(data) => {
                    // 부모 모달 데이터 업데이트
                    props.updateModalData?.(modalId!, data);
                    // 자식 모달 닫기
                    props.closeModal?.(childModalId!);
                  }}
                />
              )
            });
          }}
        />
      ),
      data: { initialValue: "test" }
    });
    
    return props.entityForm;
  });
```

## 🚀 실제 사용 시나리오

### 사용자 선택 모달
```typescript
const selectUserButton = new EntityFormButton("selectUser")
  .withLabel("사용자 선택")
  .withOnClick(async (props) => {
    const modalId = props.showModal?.({
      title: "사용자 선택",
      size: "xl",
      content: (
        <UserSelectionGrid
          onSelect={(user) => {
            // 선택된 사용자 정보를 EntityForm에 설정
            props.entityForm.setValue("selectedUserId", user.id);
            props.entityForm.setValue("selectedUserName", user.name);
            
            // 모달 닫기
            props.closeModal?.(modalId!);
          }}
        />
      )
    });
    
    return props.entityForm;
  });
```

### 파일 업로드 모달
```typescript
const uploadButton = new EntityFormButton("uploadFile")
  .withLabel("파일 업로드")
  .withOnClick(async (props) => {
    const modalId = props.showModal?.({
      title: "파일 업로드",
      size: "lg",
      content: (
        <FileUploadComponent
          onUploadComplete={(fileInfo) => {
            // 업로드된 파일 정보를 EntityForm에 설정
            props.entityForm.setValue("attachmentId", fileInfo.id);
            
            // 성공 알림 후 모달 닫기
            props.setNotifications?.(["파일이 성공적으로 업로드되었습니다."]);
            props.closeModal?.(modalId!);
          }}
          onError={(error) => {
            props.setErrors?.([`업로드 오류: ${error.message}`]);
          }}
        />
      ),
      closeOnClickOutside: false
    });
    
    return props.entityForm;
  });
```

## 🎯 핵심 특징

1. **모달 스택 관리**: 여러 모달을 동시에 열고 올바른 z-index로 관리
2. **데이터 전달**: 모달 간 데이터 공유 및 업데이트
3. **후처리 액션**: 모달 닫기 전/후 콜백 실행
4. **조건부 표시**: step 정보나 EntityForm 상태에 따른 동적 버튼 제어
5. **에러 처리**: 모달 내 에러 발생 시 안전한 처리
6. **키보드 지원**: ESC 키로 최상위 모달만 닫기 