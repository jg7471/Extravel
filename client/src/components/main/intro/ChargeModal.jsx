import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from '../../../scss/ChargeModal.module.scss';
import { BsXLg } from 'react-icons/bs';
import goldMedal from '../../../assets/img/gold.png';
import silverMedal from '../../../assets/img/silver.png';
import bronzeMedal from '../../../assets/img/bronze.png';
import axios from 'axios';
import AuthContext from '../../../utils/AuthContext';
import { API_BASE_URL } from '../../../config/host-config';

const ChargeModal = ({ toggle }) => {
  const { id, grade, name } = useContext(AuthContext);
  const modalBackground = useRef();
  const [text, setText] = useState(0);
  const [calculatedNumber, setCalculatedNumber] =
    useState(0);
  const [chargePoint, setChargePoint] = useState(0);
  const [currentEtp, setCurrentEtp] = useState(0);

  useEffect(() => {
    console.log('해당 유저의PK id 값 확인: ', id);
    console.log('해당 유저의 grade 확인: ', grade);
    async function fetchData() {
      try {
        const response = await axios.post(
          API_BASE_URL + '/payment/pointInfo',
          { id },
        );
        console.log(response.data);
        setCurrentEtp(response.data.etPoint);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchData();
  }, []);

  const getMultiplier = (grade) => {
    switch (grade) {
      case 'BRONZE':
        return 1.001;
      case 'SILVER':
        return 1.002;
      case 'GOLD':
        return 1.003;
      default:
        return 1.001;
    }
  };

  const getPointMultiplier = (grade) => {
    switch (grade) {
      case 'BRONZE':
        return 0.001;
      case 'SILVER':
        return 0.002;
      case 'GOLD':
        return 0.003;
      default:
        return 0.001;
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    const numberValue = Number(value.replace(/,/g, ''));

    if (!isNaN(numberValue)) {
      if (numberValue >= 0 && numberValue <= 100000000) {
        setText(numberValue);

        const pointMultiplier = getPointMultiplier(grade);
        const calculated = numberValue * pointMultiplier;
        setCalculatedNumber(calculated);

        const multiplier = getMultiplier(grade);
        const chargePointValue = numberValue * multiplier;
        setChargePoint(chargePointValue);
      } else {
        alert('1억 원 이하만 충전 가능합니다.');
        setText(0);
        setCalculatedNumber(0);
        setChargePoint(0);
      }
    } else {
      alert('숫자와 쉼표(,)만 입력 가능합니다.');
      setText(0);
      setCalculatedNumber(0);
      setChargePoint(0);
    }
  };

  const handleClose = (e) => {
    if (e.target === modalBackground.current) {
      console.log('close 핸들러가 발동됨!');
    }
  };

  // 카카오 페이 결제 함수
  let tid = 0;
  const confirmPayment = async () => {
    try {
      const res = await axios.post(
        API_BASE_URL + '/payment/confirm/' + tid,
      );
      if (res.status === 200) {
        console.log(res.data);
        const result = res.data.status;
        switch (result) {
          case 'SUCCESS':
            alert('ET 포인트 충전이 완료되었습니다.');
            break;
          case 'CANCELED':
            alert('결제가 취소되었습니다!');
            break;
          case 'FAILED':
            alert(
              '결제에 실패했습니다. 다시 시도해 주세요',
            );
            break;
          case 'PENDING':
            alert(
              '결제창이 닫혔습니다. 다시 시도해 주세요',
            );
            break;
        }
      } else {
        // 결제 실패 시 새로운 페이지로 이동하며 상태 전달
      }
    } catch (error) {
      console.error(
        '결제 확인 중 오류가 발생했습니다',
        error,
      );
    }
  };

  const openPaymentPopup = (popUrl) => {
    const popup = window.open(
      popUrl,
      '카카오페이 결제',
      'width=500,height=600',
    );

    const paymentCheck = setInterval(() => {
      if (popup.closed) {
        clearInterval(paymentCheck);
        confirmPayment();
      }
    }, 1000);
  };

  const payHandler = async () => {
    console.log('충전하기 버튼이 클릭됨!');
    try {
      const res = await axios.post(
        API_BASE_URL + '/payment/ready',
        {
          id,
          price: text,
          itemName: 'ET 포인트',
        },
      );
      tid = res.data.tid;
      if (res.status === 200) {
        openPaymentPopup(res.data.next_redirect_pc_url);
      }
    } catch {
      console.log('axios 요청 보낼 때 오류가 발생했습니다');
    }
  };

  return (
    <div
      className={styles.modalContainer}
      ref={modalBackground}
      onClick={handleClose}
    >
      <div className={styles.modalContent}>
        <BsXLg
          className={styles.modalCloseBtn}
          onClick={toggle}
        />

        <h1>ETP 충전하기</h1>
        <h5>ExTravel Point</h5>

        <div className={styles.chargeTable}>
          <div className={styles.tableHeader}>
            <div className={styles.grade}>등급</div>
            <div className={styles.criteria}>기준</div>
            <div className={styles.benefit}>혜택</div>
          </div>
          <div className={styles.goldGrade}>
            <div>
              <img src={goldMedal} alt='Gold Medal' />
            </div>
            <div className={styles.money}>
              포인트 충전 누적 금액
              <br />
              <strong> 1천만 원</strong> 이상
            </div>
            <div>
              포인트 충전 금액의
              <br />
              <strong>0.3% </strong>적립
            </div>
          </div>
          <div className={styles.silverGrade}>
            <div>
              <img src={silverMedal} alt='Silver Medal' />
            </div>
            <div className={styles.money}>
              포인트 충전 누적 금액
              <br />
              <strong>5백만 원 </strong>이상
            </div>
            <div>
              포인트 충전 금액의
              <br />
              <strong>0.2% </strong>적립
            </div>
          </div>
          <div className={styles.bronzeGrade}>
            <div>
              <img src={bronzeMedal} alt='Bronze Medal' />
            </div>
            <div className={styles.money}>
              <strong>회원가입한 모든 회원</strong>
            </div>
            <div>
              포인트 충전 금액의
              <br />
              <strong>0.1%</strong> 적립
            </div>
          </div>
        </div>

        <div className={styles.currentMoney}>
          보유 포인트
          <div className={styles.currentMoneyInput}>
            {currentEtp.toLocaleString('ko-KR')}P
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.chargeAmount}>
            <div className={styles.chargeAmountTitle}>
              충전 금액
            </div>
            <div className={styles.chargeInput}>
              <div>
                충전할 금액을 입력하세요.(1,000원 이상 충전
                가능)
              </div>
              <input
                type='text'
                value={text.toLocaleString('ko-KR')}
                onChange={handleChange}
              />
              원 <br />
            </div>

            <div className={styles.upPoint}>
              + 적립 포인트
            </div>
            <div className={styles.pointContainer}>
              <div className={styles.plusPoint}>
                {calculatedNumber.toLocaleString('ko-KR')}{' '}
              </div>{' '}
              P
            </div>

            <div className={styles.explain}>
              {name} 님의 등급은 {grade}입니다.
              <br />
              포인트 충전 금액의{' '}
              {getPointMultiplier(grade) * 100 + '%'}가
              적립됩니다.
            </div>
            <div className={styles.total}>
              = {chargePoint.toLocaleString('ko-KR')} P
            </div>
          </div>

          <div className={styles.totalAmount}>
            <div className={styles.totalAmountTitle}>
              충전 후 예상 포인트
            </div>
            <div className={styles.totalAmountInput}>
              {(
                currentEtp +
                text +
                calculatedNumber
              ).toLocaleString('ko-KR')}
              P
            </div>
            <button
              className={styles.chargeBtn}
              onClick={payHandler}
            >
              충전하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargeModal;
