function doPost(e) {
  try {
    // ⚠️ 여기에 실제 스프레드시트 ID를 입력하세요
    // 스프레드시트 URL에서 /d/ 다음에 나오는 긴 문자열이 ID입니다
    const SPREADSHEET_ID = '스프레드시트ID';
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 현재 날짜로 시트 이름 생성 (예: 2025-09-30)
    const today = new Date();
    const sheetName = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    // 해당 날짜의 시트가 있는지 확인, 없으면 생성
    let sh = ss.getSheetByName(sheetName);
    if (!sh) {
      sh = ss.insertSheet(sheetName);
      Logger.log('새 시트 생성: ' + sheetName);
    }

    // 헤더 설정 (첫 실행시에만)
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, 7).setValues([[
        '제출 시간',
        '이름',
        '소속/직급',
        'AI 활용 목적',
        '해결하고 싶은 문제',
        '기대 효과',
        '기타 의견'
      ]]);

      // 헤더 스타일링
      const headerRange = sh.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setHorizontalAlignment('center');
      
      // 열 너비 자동 조정
      sh.setColumnWidth(1, 150); // 제출 시간
      sh.setColumnWidth(2, 100); // 이름
      sh.setColumnWidth(3, 150); // 소속/직급
      sh.setColumnWidth(4, 300); // AI 활용 목적
      sh.setColumnWidth(5, 350); // 해결하고 싶은 문제
      sh.setColumnWidth(6, 250); // 기대 효과
      sh.setColumnWidth(7, 250); // 기타 의견
      
      // 헤더 행 고정
      sh.setFrozenRows(1);
    }

    // POST 데이터 파싱
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        Logger.log('JSON parse error: ' + parseErr);
        data = e.parameter || {};
      }
    } else {
      data = e ? (e.parameter || {}) : {};
    }

    Logger.log('Received data: ' + JSON.stringify(data));

    // 새 행에 데이터 추가
    const newRow = [
      data.timestamp || new Date().toLocaleString('ko-KR'),
      data.name || '',
      data.position || '',
      data.purpose || '',
      data.problem || '',
      data.expectation || '',
      data.additional || ''
    ];
    
    sh.appendRow(newRow);
    
    // 새로 추가된 행의 스타일 설정
    const lastRow = sh.getLastRow();
    const dataRange = sh.getRange(lastRow, 1, 1, 7);
    dataRange.setVerticalAlignment('top');
    dataRange.setWrap(true);
    
    // 교대로 배경색 설정 (가독성 향상)
    if (lastRow % 2 === 0) {
      dataRange.setBackground('#f8f9fa');
    }

    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success', 
        message: '제출이 완료되었습니다!',
        row: lastRow
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error: ' + err);

    // 에러 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error', 
        message: String(err)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// OPTIONS 요청 처리 (CORS 대응)
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

// 디버그용 GET 요청
function doGet() {
  return ContentService
    .createTextOutput('AI 활용 계획 Apps Script가 정상 작동 중입니다!')
    .setMimeType(ContentService.MimeType.TEXT);
}
