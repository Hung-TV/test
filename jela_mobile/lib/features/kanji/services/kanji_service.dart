import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/kanji_models.dart';

class KanjiService {
  final ApiClient _apiClient = ApiClient();

  Future<List<KanjiLevelOverview>> getLevels() async {
    final response = await _apiClient.get(
      ApiConstants.kanjiLevels,
      requireAuth: true,
    );

    final List<dynamic> data;
    if (response is List) {
      data = response;
    } else if (response is Map && response['data'] is List) {
      data = response['data'] as List;
    } else {
      data = [];
    }

    return data
        .map(
          (json) => KanjiLevelOverview.fromJson(
            Map<String, dynamic>.from(json as Map),
          ),
        )
        .toList();
  }

  Future<Map<String, dynamic>> getKanjiByLevel({
    required String level,
    int page = 1,
  }) async {
    final response = await _apiClient.get(
      '${ApiConstants.kanjiList}?level=$level&page=$page',
      requireAuth: false,
    );

    final Map<String, dynamic> body = Map<String, dynamic>.from(response as Map);
    final List<dynamic> content = body['content'] as List? ?? [];
    final kanjis = content
        .map((json) => KanjiSummary.fromJson(Map<String, dynamic>.from(json as Map)))
        .toList();

    return {
      'kanjis': kanjis,
      'totalPages': body['totalPages'] as int? ?? 1,
      'totalElements': body['totalElements'] as int? ?? 0,
    };
  }

  Future<List<KanjiSummary>> search(String searchKey) async {
    final response = await _apiClient.get(
      '${ApiConstants.kanjiSearch}?searchKey=${Uri.encodeComponent(searchKey)}',
      requireAuth: false,
    );

    final List<dynamic> data;
    if (response is List) {
      data = response;
    } else if (response is Map && response['data'] is List) {
      data = response['data'] as List;
    } else {
      data = [];
    }

    return data
        .map(
          (json) => KanjiSummary.fromJson(
            Map<String, dynamic>.from(json as Map),
          ),
        )
        .toList();
  }

  Future<KanjiDetail> getDetail(int id) async {
    final response = await _apiClient.get(
      ApiConstants.kanjiDetail(id),
      requireAuth: true,
    );
    return KanjiDetail.fromJson(Map<String, dynamic>.from(response as Map));
  }

  Future<Map<String, dynamic>> getHistory({int page = 1}) async {
    final response = await _apiClient.get(
      '${ApiConstants.kanjiHistory}?page=$page',
      requireAuth: true,
    );

    final Map<String, dynamic> body = Map<String, dynamic>.from(response as Map);
    final List<dynamic> list = body['hisKanjiList'] as List? ?? [];
    final historyItems = list
        .map((json) => KanjiHistoryItem.fromJson(Map<String, dynamic>.from(json as Map)))
        .toList();

    return {
      'history': historyItems,
      'totalPages': body['totalPages'] as int? ?? 1,
      'totalRecords': body['totalRecords'] as int? ?? 0,
    };
  }

  Future<void> deleteHistory(int id) async {
    await _apiClient.delete(
      ApiConstants.kanjiHistoryDelete(id),
      requireAuth: true,
    );
  }
}
