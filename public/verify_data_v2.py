#!/usr/bin/env python3
"""
数据真实性验证工具 v2（强化版）

验证逻辑：
1. 数据在BP原文里 → ✅ 通过
2. 数据不在BP里，但有"来源：XXX"或"可信度★"标注 → ⚠️ 需人工核实来源是否真实
3. 数据不在BP里，且无任何来源标注 → ❌ 疑似捏造，必须处理

强制措施：
- 第3类数据达到一定数量 → 研报不准发出
- 第2类数据 → 必须人工确认来源存在
"""

import re, sys, os

def extract_data_with_context(text):
    """提取数据点及其上下文（周围100字），用于判断是否有来源标注"""
    data_pattern = r'\d+[\.]\d+[%亿万千米台人万元公斤个]+|\d+[%亿万千米台人万元公斤个]+|约\d+[%亿万千米台人万元]+'
    results = []
    for m in re.finditer(data_pattern, text):
        val = m.group()
        if re.match(r'\d{4}年$', val):  # 跳过纯年份
            continue
        if len(val) < 2:
            continue
        start = max(0, m.start() - 100)
        end = min(len(text), m.end() + 100)
        context = text[start:end]
        results.append({
            'value': val,
            'context': context,
            'position': m.start()
        })
    return results

def has_source_annotation(context):
    """检查上下文是否有来源标注"""
    source_markers = [
        '来源：', '来源:', '数据来源：', '数据来源:',
        '可信度', '★★★★', '★★★', '★★', '★',
        '据', '根据', '依据',
        '商业计划书', 'BP', 'ppt', 'PPT',
        '国家统计局', '人社部', '工信部',
        'Global Market Insights', 'Interact Analysis', 'GGII', 'BCG', '麦肯锡',
        '贝哲斯', 'Fortune Business'
    ]
    return any(marker in context for marker in source_markers)

def main():
    if len(sys.argv) < 3:
        print("用法: python3 verify_data_v2.py <BP原文.txt> <研报章节.txt> [章节2.txt...]")
        sys.exit(1)
    
    bp_path = sys.argv[1]
    ch_paths = sys.argv[2:]
    
    with open(bp_path, encoding='utf-8') as f:
        bp_text = f.read()
    
    print(f"BP原文: {len(bp_text)}字符 | 待检: {len(ch_paths)}个章节\n")
    
    all_suspects = {}  # 疑似捏造（无来源标注）
    all_needs_review = {}  # 需人工核实（无BP来源但有来源标注）
    
    for ch_path in ch_paths:
        if not os.path.exists(ch_path):
            continue
        
        with open(ch_path, encoding='utf-8') as f:
            ch_text = f.read()
        
        dp = extract_data_with_context(ch_text)
        suspect_count = 0
        review_count = 0
        
        print(f"=== {os.path.basename(ch_path)} ===")
        print(f"  数据点总数: {len(dp)}")
        
        for item in dp:
            val = item['value']
            ctx = item['context']
            
            # 查BP
            in_bp = re.search(re.escape(val), bp_text) is not None
            has_source = has_source_annotation(ctx)
            
            if in_bp:
                continue  # 有BP来源，跳过
            elif has_source:
                review_count += 1  # 有来源标注（非BP），需人工核实
            else:
                suspect_count += 1
                if suspect_count <= 5:  # 只打印前5个
                    print(f"  ⚠️ 疑似捏造: {val}  (上下文: ...{ctx[:50]}...)")
        
        print(f"  ✅ BP来源: {len(dp) - review_count - suspect_count}")
        print(f"  ⚠️  需核实（非BP有标注）: {review_count}")
        print(f"  ❌ 疑似捏造（无任何来源）: {suspect_count}")
        print()
        
        all_suspects[os.path.basename(ch_path)] = suspect_count
        all_needs_review[os.path.basename(ch_path)] = review_count
    
    total_suspect = sum(all_suspects.values())
    total_review = sum(all_needs_review.values())
    
    print(f"{'='*50}")
    print(f"总结:")
    print(f"  疑似捏造（必须处理）: {total_suspect}个")
    print(f"  需人工核实（建议确认）: {total_review}个")
    
    if total_suspect > 0:
        print(f"\n⚠️ 强制措施: 仍有 {total_suspect} 个疑似捏造数据点，研报不应发出")
        return 1
    elif total_review > 0:
        print(f"\n⚠️ 建议: {total_review} 个数据点来源待人工确认")
        return 0
    else:
        print(f"\n✅ 所有数据均有来源或已标注，研报可发出")
        return 0

if __name__ == '__main__':
    sys.exit(main())
