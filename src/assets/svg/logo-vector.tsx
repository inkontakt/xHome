import type { SVGAttributes } from 'react'

const LogoVector = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='none' {...props}>
      <mask
        id='mask0_27249_287727'
        style={{ maskType: 'luminance' }}
        maskUnits='userSpaceOnUse'
        x='0'
        y='7'
        width='15'
        height='26'
      >
        <path d='M0 7.47131H14.9088V32.5354H0V7.47131Z' fill='white' />
      </mask>
      <g mask='url(#mask0_27249_287727)'>
        <path d='M0 32.5051L7.2316 20.0001L0 7.49838H7.67386L14.9088 20.0001L7.67386 32.5051H0Z' fill='currentColor' />
      </g>
      <mask
        id='mask1_27249_287727'
        style={{ maskType: 'luminance' }}
        maskUnits='userSpaceOnUse'
        x='25'
        y='7'
        width='15'
        height='26'
      >
        <path d='M25.0913 7.47131H40.0001V32.5354H25.0913V7.47131Z' fill='white' />
      </mask>
      <g mask='url(#mask1_27249_287727)'>
        <path
          d='M40.0001 7.49838L32.7685 20.0001L40.0001 32.5051H32.3229L25.0913 20.0001L32.3229 7.49838H40.0001Z'
          fill='currentColor'
        />
      </g>
      <mask
        id='mask2_27249_287727'
        style={{ maskType: 'luminance' }}
        maskUnits='userSpaceOnUse'
        x='7'
        y='25'
        width='26'
        height='16'
      >
        <path d='M7.45459 25.0913H32.7348V40.0002H7.45459V25.0913Z' fill='white' />
      </mask>
      <g mask='url(#mask2_27249_287727)'>
        <path
          d='M32.5023 40.0004L20.0007 32.7688L7.49561 40.0004V32.3266L20.0007 25.0916L32.5023 32.3266V40.0004Z'
          fill='currentColor'
        />
      </g>
      <mask
        id='mask3_27249_287727'
        style={{ maskType: 'luminance' }}
        maskUnits='userSpaceOnUse'
        x='7'
        y='0'
        width='26'
        height='15'
      >
        <path d='M7.26221 0.000213623H32.5424V14.909H7.26221V0.000213623Z' fill='white' />
      </mask>
      <g mask='url(#mask3_27249_287727)'>
        <path
          d='M7.49512 0.000183105L20.0002 7.23178L32.5019 0.000183105V7.67742L20.0002 14.909L7.49512 7.67742V0.000183105Z'
          fill='currentColor'
        />
      </g>
    </svg>
  )
}

export default LogoVector
