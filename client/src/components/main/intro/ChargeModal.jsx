import React, { useRef, useState } from 'react';
import styles from '../../../scss/ChargeModal.module.scss';
import { BsXLg } from 'react-icons/bs';
import goldMedal from '../../../assets/img/gold.png';
import silverMedal from '../../../assets/img/silver.png';
import bronzeMedal from '../../../assets/img/bronze.png';
import axios from 'axios';

const ChargeModal = ({ setModalOpen }) => {
  const modalBackground = useRef();
  const [text, setText] = useState('');

  const handleChange = (e) => {
    const { value } = e.target;

    const numberValue = Number(value.replace(/,/g, ''));

    if (!isNaN(numberValue)) {
      if (numberValue >= 0 && numberValue <= 100000000) {
        const formattedNumber =
          numberValue.toLocaleString();
        setText(formattedNumber);
      } else {
        alert('1억 원 이하만 충전 가능합니다.');
        setText('');
      }
    } else {
      alert('숫자와 쉼표(,)만 입력 가능합니다.');
      setText('');
    }
  };

  function handleClose(e) {
    if (e.target === modalBackground.current) {
      setModalOpen(false);
    }
  }

  const confirmPayment = async () => {
    try {
      const res = await axios.get(
        'http://localhost:8181/payment/confirm',
      );
      if (res.status === 200) {
        // 결제 성공 시 새로운 페이지로 이동하며 상태 전달
        alert('ET 포인트 충전이 완료되었습니다.');
      } else {
        // 결제 실패 시 새로운 페이지로 이동하며 상태 전달
        alert('실패했습니다.');
      }
    } catch (error) {
      console.error(
        '결제 확인 중 오류가 발생했습니다',
        error,
      );
      // 결제 실패 시 새로운 페이지로 이동하며 상태 전달
      history.push({
        pathname: '/new-page',
        state: { success: false },
      });
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

        // 필요한 후속 작업 수행
      }
    }, 1000);
  };

  const payHandler = async () => {
    console.log('충전하기 버튼이 클릭됨!');
    try {
      const res = await axios.post(
        'http://localhost:8181/payment/ready',
        {
          price: 1000,
          itemName: 'ET 포인트',
          plusPoint: 1000 * 0.001,
        },
      );
      console.log(res);
      console.log(res.data.next_redirect_pc_url);
      if (res.status === 200) {
        openPaymentPopup(res.data.next_redirect_pc_url);
      }
    } catch {
      console.log('결제 진행 중 오류가 발생했습니다');
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
          onClick={() => setModalOpen(false)}
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
              <strong>1.5% </strong>적립
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
              <strong>1.0% </strong>적립
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
              <strong>0.5%</strong> 적립
            </div>
          </div>
        </div>

        <div className={styles.currentMoney}>
          보유 포인트
          <div className={styles.currentMoneyInput}>
            {Number(text) +
              Number(text.replace(/,/g, '') * 0.005)}{' '}
            P
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.chargeAmount}>
            <div className={styles.chargeAmountTitle}>
              충전 금액
            </div>
            <div className={styles.chargeInput}>
              <div>
                충전할 금액을 입력하세요.(1000원 이상 충전
                가능)
              </div>
              <input
                type='text'
                value={text}
                onChange={handleChange}
              />
              원 <br />
            </div>

            <div className={styles.upPoint}>
              + 적립 포인트
            </div>
            <div className={styles.pointContainer}>
              <div className={styles.plusPoint}>
                {Number(text.replace(/,/g, '') * 0.005)}{' '}
              </div>{' '}
              P
            </div>

            <div className={styles.explain}>
              홍길동 님의 등급은 브론즈입니다.
              <br />
              포인트 충전 금액의 0.5%가 적립됩니다.
            </div>
            <div className={styles.total}>
              ={' '}
              {Number(text.replace(/,/g, '')) +
                Number(text.replace(/,/g, '') * 0.005)}{' '}
              P
            </div>
          </div>

          <div className={styles.totalAmount}>
            <div className={styles.totalAmountTitle}>
              충전 후 예상 포인트
            </div>
            <div className={styles.totalAmountInput}>
              {Number(text.replace(/,/g, '')) +
                Number(text.replace(/,/g, '') * 0.005)}{' '}
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
