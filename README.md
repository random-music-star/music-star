

# 온라인 멀티플레이 음악 퀴즈 게임, 🎹 랜덤 뮤직스타 🎵🎶
### [🔗 서비스로 이동하기](https://www.music-random.com)

### 🗓️ 기간: 2025.02.24 ~ 2025.04.11(7주)
### 👥 인원: 6명 (BE:3 FE:3)
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/HoberMin"><img src="https://avatars.githubusercontent.com/u/102784200?v=4" width="100px;" alt="github HoberMin"/><br /><sub><b>(팀장) FE 손호민</b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/songhaeunsong"><img src="https://avatars.githubusercontent.com/u/84169393?v=4" width="100px;" alt="github "/><br /><sub><b>FE 송하은</b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/minjeeki"><img src="https://avatars.githubusercontent.com/u/148981647?v=4" width="100px;" alt="github "/><br /><sub><b>FE 김민지</b></sub></a><br /></td>
     <tr/>
      <td align="center"><a href="https://github.com/leedongkyu0407"><img src="https://avatars.githubusercontent.com/u/54134100?v=4" width="100px;" alt="github "/><br /><sub><b>BE 이동규</b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/aseongjun99"><img src="https://avatars.githubusercontent.com/u/154566676?v=4" width="100px;" alt="github "/><br /><sub><b>BE 안성준</b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/won-joon"><img src="https://avatars.githubusercontent.com/u/59519591?v=4" width="100px;" alt="github "/><br /><sub><b>BE 서원준</b></sub></a><br /></td>
    </tr>
  </tbody>
</table>

<br/>

### 👩🏻‍💻 기술 스택

### ✔️Frond-end
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white"><img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white"><img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=TailwindCSS&logoColor=white"><img src="https://img.shields.io/badge/Zustand-FFBD15?style=for-the-badge&logo=Zustand&logoColor=purple">

### ✔️Back-end
<img src="https://img.shields.io/badge/Java_17-C00000?style=for-the-badge&logo=Java_17&logoColor=white"><img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=Spring_Boot&logoColor=white"><img src="https://img.shields.io/badge/JPA-000000?style=for-the-badge&logo=JPA&logoColor=white"><img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=Spring_Security&logoColor=white"><img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">


### ✔️Communication
<img src="https://img.shields.io/badge/REST_API-AAAAAA?style=for-the-badge&logo=REST_API&logoColor=black"><img src="https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=WebSocket&logoColor=white"><img src="https://img.shields.io/badge/STOMP-4B1B1A?style=for-the-badge&logo=STOMP&logoColor=white"><img src="https://img.shields.io/badge/SSE-22376A?style=for-the-badge&logo=SSE&logoColor=white">


### ✔️Infra
<img src="https://img.shields.io/badge/Github_Actions-2088FF?style=for-the-badge&logo=Github_Actions&logoColor=white"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=black"><img src="https://img.shields.io/badge/AWS_EC2-EC7027?style=for-the-badge&logo=AWS_EC2&logoColor=black"><img src="https://img.shields.io/badge/AWS_RDS-EC7027?style=for-the-badge&logo=AWS_RDS&logoColor=black"><img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=Nginx&logoColor=white">

<br/>
<br/>

### 📺 영상 포트폴리오
![랜뮤스영상 (1)](https://github.com/user-attachments/assets/e5a8cadb-7b69-4c47-97b3-d9cfd71c59bd)

<br/>
<br/>

### 💿 주요 기능
랜덤! 뮤직스타는 운·전략이 결합된 `보드판 모드`와 실력 중심의 `점수판 모드`를 제공합니다.

#### 공통 규칙(룰렛)
모드 룰렛이 돌아가며 랜덤으로 모드(한곡모드, 믹스모드, AI모드)가 선택됩니다.

<img src="https://github.com/user-attachments/assets/df61d674-56e5-47e4-9ffb-865d5a9bfc92" width="400" alt="모드 룰렛 GIF" />

### 1️⃣ 보드판 모드

- 가장 빠르게 정답을 맞힌 플레이어가 보드판에서 1~3칸을 랜덤으로 이동합니다.
- 이동 이후, 10종의 랜덤 이벤트 중 하나가 발생합니다
  
<table>
  <tr>
    <td style="border: none;">
      <img src="https://github.com/user-attachments/assets/7e131137-d34e-4e47-8b32-9fd6de7fd4b2" width="450" alt="이동 및 이벤트 GIF" />
    </td>
    <td style="border: none; vertical-align: top; padding-left: 10px;">
      <strong>이벤트 종류</strong>
      <ul>
        <li>따라 잡은 플레이어와 자리 교체</li>
        <li>가장 가까운 플레이어의 위치로 이동</li>
        <li>앞으로 1 or 2칸 이동</li>
        <li>앞으로 5칸 이동</li>
        <li>뒤로 1 or 2칸 이동</li>
        <li>뒤로 5칸 이동</li>
        <li>다른 플레이어 끌어 오기</li>
        <li>다른 플레이어와 자리 바꾸기</li>
        <li>랜덤 이동</li>
        <li>아무 일도 일어나지 않음</li>
      </ul>
    </td>
  </tr>
</table>

- 👑 `보드 끝 지점에 도착한 플레이어` / `가장 많이 이동한 플레이어` 가 최종 승리합니다.

### 2️⃣ 점수판 모드

- 정답을 맞힐 때마다 점수를 획득하고, 실시간으로 랭킹이 업데이트됩니다.
- 랜덤 이벤트 없이 퀴즈 실력으로만 승부가 갈립니다.

<img src="https://github.com/user-attachments/assets/11c7d11b-9b87-4961-a5df-f19c07d167c2" width="450" alt="점수판" />

- 👑 설정한 총 라운드 수가 끝나면 점수에 따라 승패가 결정됩니다.

<br/>
<br/>

### 🧩 서비스 아키택처
![image](https://github.com/user-attachments/assets/7241d068-30ac-4b21-8749-bd0d39cfb894)





